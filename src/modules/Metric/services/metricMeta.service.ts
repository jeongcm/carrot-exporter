import { IResourceGroup } from "@common/interfaces/resourceGroup.interface";
import { HttpException } from "@common/exceptions/HttpException";
import { DB } from "@/database";
import config from "@/config";
import crypto from "crypto";
import { Op } from "sequelize";
import console from "console";
import TableIdService from "@common/tableId/tableId";
import mysql from "mysql2/promise";

class MetricMetaService {
  public resourceGroup = DB.ResourceGroup
  public resource = DB.Resource
  public metricMeta = DB.MetricMeta
  public tableIdService = new TableIdService()

  private async procMetricMeta(clusterUuid, metricMetaResult): Promise<void> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { deletedAt: null, resourceGroupUuid: clusterUuid }
    })

    if (!resourceGroup) {
      throw new HttpException(404, `not found resourceGroup(clusterUuid: ${clusterUuid})`)
    }

    let metricMetaList: any = []
    let resourceKeyCacheMap: any = {}
    let noResourceMap: any = {}
    let metaHashMap: any = {}

    for (let data of metricMetaResult) {
      let meta = this.getMetricMetaQuery(clusterUuid, resourceGroup.customerAccountKey, data)
      let metricMetaHash = await this.metricMetaToSHA1(meta)
      meta['metric_meta_hash'] = metricMetaHash

      if (metaHashMap[metricMetaHash]) {
        continue
      } else {
        metaHashMap[metricMetaHash] = true
      }

      // port
      if (meta["metric_meta_target_instance"].includes(":"+config.metricMeta.specifiedNodePort)) {
        let nodeKey = meta["metric_meta_target_instance"]
        if (!resourceKeyCacheMap[nodeKey]) {
          let resource = await this.resource.findOne({
            where: {resourceType: "ND", resourceInstance: nodeKey, resourceGroupKey: resourceGroup.resourceGroupKey},
            attributes: ['resourceKey']
          })
          if (!resource) {
            noResourceMap[nodeKey]++
            continue
          } else {
            resourceKeyCacheMap[nodeKey] = resource.resourceKey
          }

        }

        if (resourceKeyCacheMap[nodeKey] < 0) {
          noResourceMap[nodeKey]++
          continue
        }
        meta['resource_key'] = resourceKeyCacheMap[nodeKey]

        // no port
      } else {
        let svcKey = meta["metric_meta_target_service"+"/"+meta["metric_meta_target"]["namespace"]]
        if (!resourceKeyCacheMap[svcKey]) {
          let resource = await this.resource.findOne({
            where: {resourceType: "SV", resourceName: meta["metric_meta_target_service"], resourceNamespace: meta["metric_meta_target"]["namespace"], resourceGroupKey: resourceGroup.resourceGroupKey},
            attributes: ['resourceKey']
          })
          if (!resource) {
            noResourceMap[meta["svcKey"]]++
            continue
          } else {
            resourceKeyCacheMap[meta["svcKey"]] = resource.resourceKey
          }
        }

        if (resourceKeyCacheMap[meta["svcKey"]] < 0) {
          noResourceMap[meta["svcKey"]]++
          continue
        }
        meta['resource_key'] = resourceKeyCacheMap[meta["svcKey"]]
      }

      metricMetaList.push(meta)
    }

    if (metricMetaList.length === 0) {
      return
    }

    let deleteKeys: any = []
    let existMetasMap: any = []
    let insertMetas: any = []

    let existMetricMetas = await this.metricMeta.findAll({
      where: {resourceGroupUuid: clusterUuid}
    })

    existMetricMetas.forEach(meta => {
      existMetasMap[meta.metricMetaHash] = meta
    })

    metricMetaList.forEach(newMeta => {
      if (!existMetasMap[newMeta.metric_meta_hash]) {
        insertMetas.push(newMeta)
      } else {
        delete existMetasMap[newMeta.metric_meta_hash]
      }
    })

    existMetricMetas.forEach(meta => {
      deleteKeys.push(meta.metricMetaKey)
    })

    // delete metric meta
    if (deleteKeys.length > 0) {
      await this.metricMeta.destroy({where: {
          metricMetaKey: {[Op.in]: deleteKeys}
        }}).catch(e => {console.log(e)})
    }

    // insert new metric metas
    const metricMetaTableIdRequest = {tableName: this.metricMeta.tableName, tableIdRange: insertMetas.length}
    let tableIds = await this.tableIdService.tableIdBulk(metricMetaTableIdRequest)
    if (!tableIds) {
      throw new HttpException(404, 'table data is empty')
    }

    tableIds.forEach((tableId, index) => {
      insertMetas[index]['metric_meta_id'] = tableId
    })

    await this.upsertMetricMetaRowQuery(resourceGroup.customerAccountKey, insertMetas)

  }

  public async upsertMetricMetaRowQuery(customerAccountKey, metas) {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query1 = `INSERT INTO MetricMeta (metric_meta_id, created_by,
                    updated_by, created_at, metric_meta_name,
                    metric_meta_description, metric_meta_type, metric_meta_unit, metric_meta_target_instance,
                    metric_meta_target_job, metric_meta_target_service, metric_meta_target_pod, metric_meta_target,
                    customer_account_key, resource_key, resource_group_uuid, metric_meta_target_metrics_path, metric_meta_hash
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                      updated_by=VALUES(updated_by),
                      metric_meta_id=VALUES(metric_meta_id),
                      metric_meta_name=VALUES(metric_meta_name),
                      metric_meta_description=VALUES(metric_meta_description),
                      metric_meta_type=VALUES(metric_meta_type),
                      metric_meta_unit=VALUES(metric_meta_unit),
                      metric_meta_target_instance=VALUES(metric_meta_target_instance),
                      metric_meta_target_job=VALUES(metric_meta_target_job),
                      metric_meta_target_service=VALUES(metric_meta_target_service),
                      metric_meta_target_pod=VALUES(metric_meta_target_pod),
                      metric_meta_target=VALUES(metric_meta_target),
                      customer_account_key=VALUES(customer_account_key),
                      resource_key=VALUES(resource_key),
                      resource_group_uuid=VALUES(resource_group_uuid),
                      metric_meta_target_metrics_path=VALUES(metric_meta_target_metrics_path),
                      metric_meta_hash=VALUES(metric_meta_hash)
                      `;
    const query2 = [];
    for (let i = 0; i < metas.length; i++) {
      query2[i] = [
        metas[i].metric_meta_id,
        metas[i].created_by,
        metas[i].updated_by,
        currentTime,
        metas[i].metric_meta_name,
        metas[i].metric_meta_description,
        metas[i].metric_meta_type,
        metas[i].metric_meta_unit,
        metas[i].metric_meta_target_instance,
        metas[i].metric_meta_target_job,
        metas[i].metric_meta_target_service,
        metas[i].metric_meta_target_pod,
        metas[i].metric_meta_target,
        customerAccountKey,
        metas[i].resource_key,
        metas[i].resource_group_uuid,
        metas[i].metric_meta_target_metrics_path,
        metas[i].metric_meta_hash,
      ]
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      database: config.db.mariadb.dbName,
      multipleStatements: true,
    });
    await mysqlConnection.query('START TRANSACTION');
    try {

      await mysqlConnection.query(query1, [query2]);
      await mysqlConnection.query('COMMIT');

      console.log('success upload metricMeta')
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');

      throw `${err}error on sql execution`;
    }
    await mysqlConnection.end();
  }
  private getMetricMetaQuery(clusterUuid, customerAccountKey, data): object {

    // prom-client에는 해당 type이 없어서 직접 만듬
    let typ
    switch (data.Type) {
      case "counter":
        typ = "CO"
        break;
      case "gauge":
        typ = "GG"
        break;
      case "histogram":
        typ = "HG"
        break;
      case "gaugehistogram":
        typ = "GH"
        break;
      case "summary":
        typ = "SM"
        break;
      case "info":
        typ = "IF"
        break;
      case "stateset":
        typ = "SS"
        break;
      case "unknown":
        typ = "UK"
        break;
    }

    let metaQuery = {}
    metaQuery['metric_meta_name'] = data?.Metric
    metaQuery['metric_meta_type'] = typ
    metaQuery['metric_meta_description'] = data?.Help
    metaQuery['metric_meta_unit'] = data?.Unit
    metaQuery['metric_meta_target_instance'] = data?.Target["instance"]
    metaQuery['metric_meta_target_job'] = data?.Target["job"]
    metaQuery['metric_meta_target_service'] = data?.Target["service"]
    metaQuery['metric_meta_target'] = data?.Target
    metaQuery['metric_meta_target_pod'] = data?.Target["pod"]
    metaQuery['created_by'] = config.partyUser.userId
    metaQuery['updated_by'] = config.partyUser.userId
    metaQuery['resource_group_uuid'] = clusterUuid
    metaQuery['customer_account_key'] = customerAccountKey
    metaQuery['metric_meta_target_metrics_path'] = data?.Target["metrics_path"]

    return metaQuery
  }

  private async metricMetaToSHA1(metricMeta: any): Promise<string> {
    let list = [metricMeta.metric_meta_target_job, metricMeta.metric_meta_target_service, metricMeta.metric_meta_target_instance, metricMeta.metric_meta_target_metrics_path, metricMeta.metric_meta_name]
    let value = list.join('.')

    let bytesData = Buffer.from(value, 'utf8')
    let hashResult = await this.SHA1(bytesData)

    return hashResult.toString('hex')
  }

  private async SHA1(b) {
    const h = crypto.createHash('sha1');
    h.update(b);

    return h.digest();
  }
}

export default MetricMetaService
