import { IResourceGroup } from "@common/interfaces/resourceGroup.interface";
import { HttpException } from "@common/exceptions/HttpException";
import { DB } from "@/database";
import config from "@/config";
import crypto from "crypto";

class MetricMetaService {
  public resourceGroup = DB.ResourceGroup
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

      if (meta["metric_meta_target_instance"]) {

      } else {

      }
    }
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
