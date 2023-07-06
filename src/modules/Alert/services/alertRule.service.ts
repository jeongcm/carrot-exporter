import { HttpException } from "@common/exceptions/HttpException";
import { DB } from "@/database";
import { IResourceGroup } from "@common/interfaces/resourceGroup.interface";
import sequelize, { Op, where } from "sequelize";
import * as crypto from "crypto";
import config from "@/config";
import mysql from "mysql2/promise";
import TableIdService from "@common/tableId/tableId";
import * as console from "console";
import AlertTimelineService from "@modules/Alert/services/alertTimeline.service";

class AlertRuleService {
  public tableIdService = new TableIdService()
  public alertTimelineService = new AlertTimelineService()
  public resourceGroup = DB.ResourceGroup;
  public alertRule = DB.AlertRule;
  public alertReceived = DB.AlertReceived;

  public async uploadAlertRule(totalMsg) {
    // 기본 변수
    const serviceUuid = totalMsg.service_uuid
    const clusterUuid = totalMsg.cluster_uuid
    const result = totalMsg.result
    if (serviceUuid === '') {
      throw new HttpException(404, 'not found service uuid')
    }

    if (clusterUuid === '') {
      throw new HttpException(404, 'not found cluster uuid')
    }

    return await this.processAlertRule(clusterUuid, result)
  }

  private async getAlertRuleByClusterUuid(clusterUuid): Promise<any> {
    let result = []
    let alertRules: any = await this.alertRule.findAll({
      attributes: [
        'alert_rule_key',
        'alert_rule_id',
        'created_by',
        [sequelize.fn('SHA1', sequelize.fn('CONCAT', sequelize.col('alert_rule_group'), '.', sequelize.col('alert_rule_name'), '.', sequelize.col('alert_rule_severity'), '.', sequelize.col('alert_rule_duration'))), 'sha1']
      ],
      where: {
        deletedAt: null,
        resourceGroupUuid: clusterUuid
      }
    });

    alertRules.forEach(alertRule => result.push({
      key: alertRule.dataValues.alert_rule_key,
      id: alertRule.dataValues.alert_rule_id,
      createdBy: alertRule.dataValues.created_by,
      SHA1: alertRule.dataValues.sha1
    }))

    return result
  }

  private async SHA1(b) {
    const h = crypto.createHash('sha1');
    h.update(b);

    return h.digest();
  }

  private async alertReceivedToSHA1(alertRuleKey, alertReceivedLabel: any): Promise<string> {
    let list = [alertRuleKey, JSON.stringify(alertReceivedLabel)]
    let value = list.join('.')

    let bytesData = Buffer.from(value, 'utf8')

    let hashResult = await this.SHA1(bytesData)

    return hashResult.toString('hex')
  }

  private async alertRuleToSHA1(alertRule: any): Promise<string> {
    let list = [alertRule.alert_rule_group, alertRule.alert_rule_name, alertRule.alert_rule_severity, alertRule.alert_rule_duration]
    let value = list.join('.')

    let bytesData = Buffer.from(value, 'utf8')
    let hashResult = await this.SHA1(bytesData)

    return hashResult.toString('hex')
  }

  private getAlertRuleKey(prevAlertRuleUniqueSet: {}, alertRuleHash: any): number {
    return prevAlertRuleUniqueSet[alertRuleHash]?.key
  }
  private getAlertRuleId(prevAlertRuleUniqueSet: {}, alertRuleHash: any): number {
    return prevAlertRuleUniqueSet[alertRuleHash]?.id
  }

  private async processAlertRule(clusterUuid, result) {
    try {
      // 1. make data
      const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
        where: { deletedAt: null, resourceGroupUuid: clusterUuid }
      })

      if (!resourceGroup) {
        throw new HttpException(404, `not found resourceGroup(clusterUuid: ${clusterUuid})`)
      }

      let prevAlertRules = await this.getAlertRuleByClusterUuid(clusterUuid)

      if (!prevAlertRules) {
        throw new HttpException(404, `not found alertRule(clusterUuid: ${clusterUuid})`)
      }

      let prevAlertRuleUniqueSet: any = {}
      prevAlertRules.forEach(prevAlertRule => prevAlertRuleUniqueSet[prevAlertRule.SHA1] = {id: prevAlertRule.id, key: prevAlertRule.key, createdBy: prevAlertRule.createdBy})

      let prevAlertReceives: any // 이전에만 존재하던 alertReceived list
      let prevAlertReceivedSet: any = {} // 이전에만 존재하는 alertReceived map
      let prevAlertReceivedIntersectionSet: any = {} // 이전과 새로운 데이터 모두 존재하는 alertReceived map
      if (Object.keys(prevAlertRuleUniqueSet).length > 0) {
        let prevAlertRuleKeys = Object.keys(prevAlertRuleUniqueSet).map(key => {
          return prevAlertRuleUniqueSet[key].key
        })

        prevAlertReceives  = await this.alertReceived.findAll({where: {
          deletedAt: null,
          alertRuleKey: {[Op.in]: prevAlertRuleKeys }
        }})

        // 이전 alertReceived 가 존재하면 alertReceived hashing 해서 key value 로 저장
        for (let prevAlertReceived of prevAlertReceives) {
          let hash = await this.alertReceivedToSHA1(prevAlertReceived.dataValues.alertRuleKey, prevAlertReceived.dataValues.alertReceivedLabels)
          prevAlertReceivedSet[hash] = prevAlertReceived.dataValues;
        }
      }

      let alertRuleSet: any = {} // 새로 들어온 alertRule map
      let newAlertReceivedSet: any = {}
      for (let group of result.groups) {
        for (let rule of group.rules) {
          if (typeof rule.labels === 'undefined') {
            continue
          }

          if (typeof rule.labels?.severity === 'undefined' || rule.labels?.severity === "none" || rule.labels?.severity === "") {
            continue
          }

          let alertRule = this.getAlertRuleQuery(clusterUuid, group.name, resourceGroup.customerAccountKey, rule)
          let alertRuleHash = await this.alertRuleToSHA1(alertRule) // make hash
          // alertRuleKey setting
          if (typeof this.getAlertRuleKey(prevAlertRuleUniqueSet, alertRuleHash) !== 'undefined') {
            alertRule["alert_rule_key"] = prevAlertRuleUniqueSet[alertRuleHash]?.key
            alertRule["alert_rule_id"] = prevAlertRuleUniqueSet[alertRuleHash]?.id
            alertRule["created_by"] = prevAlertRuleUniqueSet[alertRuleHash]?.createdBy
          }

          alertRule["updated_by"] = config.partyUser.userId // editor
          alertRuleSet[alertRuleHash] = alertRule
          // alertReceived

          if (!rule.alerts) {
            continue
          }

          for (let alert of rule?.alerts) {
            let alertReceived: any = this.getAlertReceivedQuery(alertRule["alert_rule_key"], resourceGroup.customerAccountKey, alert) // get alertReceived query

            let alertReceivedHash = await this.alertReceivedToSHA1(alertReceived.alertRuleKey, alertReceived.alertReceivedLabels) // make alertReceived hash
            alertReceived["updatedBy"] = config.partyUser.userId // editor

            // 이전 alertReceived에 존재한다면
            if (typeof prevAlertReceivedSet[alertReceivedHash] !== 'undefined') {
              // 이전과 새로운 데이터를 모두 가진 alertReceived map에 얼럿 추가
              prevAlertReceivedIntersectionSet[alertReceivedHash] = prevAlertReceivedSet[alertReceivedHash]
            }
            // 또다시 들어온 alertReceived 을 prevAlertReceived map에서 삭제
            delete prevAlertReceivedSet[alertReceivedHash]
            if (!newAlertReceivedSet[alertRuleHash]) {
              newAlertReceivedSet[alertRuleHash] = {}
              newAlertReceivedSet[alertRuleHash][alertReceivedHash] = alertReceived
            } else {
              newAlertReceivedSet[alertRuleHash][alertReceivedHash] = alertReceived
            }
          }
        }
      }

      // 2. upsert to database

      let currentTime = new Date()
      let expirtedDuration: any = config.alert.alertExpiredDate
      let expiredDate = currentTime.getTime() - expirtedDuration

      // 필터 함수를 통해서 alertRuleSet에 이전 얼럿 룰이 존재한다면 삭제하지 않고 존재하지 않으면 삭제 처리
      const unUsedAlertRuleKeys = this.setUniqueValues(Object.entries(prevAlertRuleUniqueSet), (k) => {
        if (alertRuleSet.hasOwnProperty(k[0])) {
          return false;
        }

        for (let value of Object.values(newAlertReceivedSet[k[0]])) {
          value['AlertReceivedState'] = "resolved";
        }

        return true;
      });

      if (unUsedAlertRuleKeys.length > 0) {
        // delete unused alertRule
        console.log("destroy unusedKey: ", unUsedAlertRuleKeys)
        await this.alertRule.destroy({where: {
          alertRuleKey: {[Op.in]: unUsedAlertRuleKeys}
          }}).catch(e => {console.log(e)})
      }

      let arrivalAlertRules = []
      let updatableAlertRules = []
      let combinedAlertRules = []
      for (const alertRuleValue of Object.values(alertRuleSet)) {
        if (typeof alertRuleValue["alert_rule_key"] === 'undefined') {
          alertRuleValue['created_by'] = config.partyUser.userId
          arrivalAlertRules.push(alertRuleValue)
        } else {
          updatableAlertRules.push(alertRuleValue)
        }

        if (alertRuleValue['alert_rule_state'] === 'inactive') {
          let alertRuleHash = await this.alertRuleToSHA1(alertRuleValue)
          if (typeof newAlertReceivedSet[alertRuleHash] !== 'undefined') {
            Object.values(newAlertReceivedSet[alertRuleHash]).forEach(alertReceived => {
              alertReceived['alert_received_state'] = 'resolved'
            })
          }
        }
      }


      if (arrivalAlertRules.length > 0) {
        const alertRuleTableIdRequest = {tableName: this.alertRule.tableName, tableIdRange: arrivalAlertRules.length}
        let tableIds = await this.tableIdService.tableIdBulk(alertRuleTableIdRequest)
        if (!tableIds) {
          throw new HttpException(404, 'table data is empty')
        }

        // 새로운 얼럿 룰에 얼럿 룰 id 할당
        tableIds.forEach((tableId, index) => {
          arrivalAlertRules[index].alert_rule_id = tableId
        })

        combinedAlertRules.push(...arrivalAlertRules)
      }


      if (updatableAlertRules.length > 0) {
        combinedAlertRules.push(...updatableAlertRules)
      }

      if (combinedAlertRules.length > 0) {
        await this.upsertAlertRuleRowQuery(resourceGroup.customerAccountKey, combinedAlertRules)
        // await this.alertRule.bulkCreate(combinedAlertRules, {
        //   updateOnDuplicate: ["updatedBy", "updatedAt", "alertRuleQuery", "alertRuleDescription", "alertRuleRunbook",
        //     "alertRuleSummary", "alertRuleState", "customerAccountKey",
        //     "alertRuleHealth", "alertRuleEvaluationTime", "alertRuleLastEvaluation"],
        // })
      }

      // 새로 생성한 alertRule list uniqueSet 추가
      prevAlertRules = await this.getAlertRuleByClusterUuid(clusterUuid)

      prevAlertRules.forEach(prevAlertRule => prevAlertRuleUniqueSet[prevAlertRule.SHA1] = {id: prevAlertRule.id, key: prevAlertRule.key, createdBy: prevAlertRule.createdBy})

      // 이전 alertReceived 삭제
      if (typeof prevAlertReceives !== 'undefined' && prevAlertReceives.length > 0) {
        let newAlertReceivedMap = {}
        Object.entries(newAlertReceivedSet).forEach((value, ) => {
          Object.entries(value[1]).forEach((v) => {
            newAlertReceivedMap[v[0]] = v[1]
          })
        })

        let alertReceivedKeys = [];
        for (const prevAlertReceived of prevAlertReceives) {
          // 1. 이전에 존재했지만 이번에 없어진 데이터
          //   - AlertReceivedState가 이전에 "resolved" 인 데이터 삭제 안함
          // 2. 이전에 존재했고 이번에도 존재하는 데이터
          //   - AlertReceivedState가 이전에 "resolved" 이고 이번에도 "resolved"이면 삭제 안함
          if (prevAlertReceived.alertReceivedState === 'resolved') {
            let arHash = await this.alertReceivedToSHA1(prevAlertReceived.alertRuleKey, prevAlertReceived.alertReceivedLabels)
            let resolvedAlertReceived = newAlertReceivedMap[arHash]
            if (!resolvedAlertReceived) {
              continue
            } else {
              //새롭게 존재한 alertReceived에 이전 resolved alert 정보가 있으면 그대로 다시 넣음
              if (resolvedAlertReceived.alertReceivedState === 'resolved') {
                continue
              }
            }
          }

          alertReceivedKeys.push(prevAlertReceived.alertReceivedKey)
        }

        await this.alertReceived.destroy({where: {
            alertReceivedKey: {[Op.in]: alertReceivedKeys},
        }}).catch(e => {console.log(e)})
      }

      // 이전 alertReceived 삭제

      if (Object.keys(prevAlertReceivedSet).length > 0 || Object.keys(newAlertReceivedSet).length > 0) {
        let insertAlertReceives: any = []
        // 새로운 AlertReceived 추가
        // - 이전 AlertReceived가 존재하고 이전 AlertReceivedState가 "resolved"이면서 새로운 상태도 "resolved"이면 추가 안함
        for (const [alertRuleHash, alertReceivedSet] of Object.entries(newAlertReceivedSet)) {
          let arSet: any = alertReceivedSet
          for (const ar of Object.values(arSet)) {
            let alertReceived: any = ar
            let arHash = await this.alertReceivedToSHA1(alertReceived.alert_rule_key, alertReceived.alert_received_labels)
            let inAlertReceived = prevAlertReceivedIntersectionSet[arHash]
            if (inAlertReceived && (inAlertReceived.AlertReceivedState === 'resolved' && alertReceived.AlertReceivedState === 'resolved')) {
                continue
            }

            alertReceived.alertRuleKey = prevAlertRuleUniqueSet[alertRuleHash].key
            alertReceived.createdBy = config.partyUser.userId
            insertAlertReceives.push(alertReceived)
          }
        }

        // 이전 AlertReceived 중 이번에 들어온 alertReceived 에서 사라진 AlertReceived 는 resolved 됐다고 간주하기 때문에
        // 이전 AlertReceivedState가 "resolved"가 아니라면 "resolved"로 변경해서 추가
        Object.values(prevAlertReceivedSet).forEach(par => {
          let prevAlertReceived: any = par
          if (prevAlertReceived.alertReceivedState != 'resolved') {
            delete prevAlertReceived.alertReceivedKey
            prevAlertReceived.alertReceivedState = 'resolved'
            insertAlertReceives.push(prevAlertReceived)
          }
        })

        // craete new arrived alertReceived
        if (insertAlertReceives.length > 0) {
          const alertReceivedTableIdRequest = {tableName: this.alertReceived.tableName, tableIdRange: insertAlertReceives.length}
          let alertReceivedTableIds = await this.tableIdService.tableIdBulk(alertReceivedTableIdRequest)
          if (!alertReceivedTableIds) {
            throw new HttpException(404, 'table data is empty')
          }

          alertReceivedTableIds.forEach((tableId, index) => {
            insertAlertReceives[index].alertReceivedId = tableId
          })

          for (const insertAlertReceived of insertAlertReceives) {
            insertAlertReceived.alertReceivedHash = await this.alertReceivedToSHA1(insertAlertReceived.alertRuleKey, insertAlertReceived.alertReceivedLabels)
          }

          await this.upsertAlertReceivedRowQuery(resourceGroup.customerAccountKey, insertAlertReceives)

          // await this.alertReceived.bulkCreate(insertAlertReceives)
        }
      }

      // process resourceGroup's alertTimeline
      // await this.alertTimelineService.processAlertTimeline(resourceGroup.customerAccountKey)

    } catch (err) {
      console.log(`failed to processAlertRule. cause: ${err}`)
      throw new HttpException(500, `failed to processAlertRule. cause: ${err}`)
    }
  }

  private getAlertRuleQuery(clusterUuid, groupName, customerAccountKey, rule): object {
    let ruleQuery = {}
    ruleQuery['alert_rule_name'] = rule.name
    ruleQuery['alert_rule_group'] = groupName
    ruleQuery['alert_rule_query'] = rule.query
    ruleQuery['alert_rule_duration'] = parseInt(rule.duration)
    ruleQuery['alert_rule_severity'] = rule.labels.severity
    ruleQuery['alert_rule_description'] = rule.annotations?.description || ''
    ruleQuery['alert_rule_runbook'] = rule.annotations?.runbook_url || ''
    ruleQuery['alert_rule_summary'] = rule.annotations?.summary || ''
    ruleQuery['alert_rule_state'] = rule.state
    ruleQuery['customer_account_key'] = customerAccountKey
    ruleQuery['resource_group_uuid'] = clusterUuid
    ruleQuery['alert_rule_health'] = rule.health
    ruleQuery['alert_rule_evaluation_time'] = rule.evaluationTime
    ruleQuery['alert_rule_last_evaluation'] = rule.lastEvaluation

    return ruleQuery
  }

  private getAlertReceivedQuery(ruleKey, customerAccountKey, received): object {
    let receivedQuery = {}
    receivedQuery['alertReceivedName'] = received.labels.alertname
    receivedQuery['alertReceivedSeverity'] = received.labels.severity
    receivedQuery['alertReceivedState'] = received.state
    receivedQuery['alertReceivedDescription'] = received.annotations?.description || ''
    receivedQuery['alertReceivedSummary'] = received.annotations?.summary || ''
    receivedQuery['alertReceivedActiveAt'] = received.activeAt
    receivedQuery['alertReceivedValue'] = parseFloat(received.value).toFixed(4)
    receivedQuery['alertReceivedNamespace'] = received.labels["namespace"]
    receivedQuery['alertReceivedNode'] = received.labels["node"] || ''
    receivedQuery['alertReceivedService'] = received.labels["service"] || ''
    receivedQuery['alertReceivedPod'] = received.labels["pod"] || ''
    receivedQuery['alertReceivedPersistentvolumeclaim'] = received.labels["persistentvolumeclaim"] || ''
    receivedQuery['alertReceivedPinned'] = 0
    receivedQuery['customerAccountKey'] = customerAccountKey
    receivedQuery['alertRuleKey'] = ruleKey
    receivedQuery['alertReceivedInstance'] = received.labels["instance"] || ''
    receivedQuery['alertReceivedLabels'] = received.labels
    receivedQuery['alertReceivedContainer'] = received.labels["container"] || ''
    receivedQuery['alertReceivedEndpoint'] = received.labels["endpoint"] || ''
    receivedQuery['alertReceivedReason'] = received.labels["reason"] || ''
    receivedQuery['alertReceivedUid'] = received.labels["uid"] || ''
    receivedQuery['alertReceivedAffectedResourceType'] = "NA";
    receivedQuery['alertReceivedAffectedResourceName'] = "NA";

    return receivedQuery
  }

  private setUniqueValues(set, filter) {
    const r = [];

    set.forEach((k) => {
      if (filter(k)) {
        r.push(k[1].key);
      }
    });

    return r;
  }

  private async upsertAlertRuleRowQuery(customerAccountKey, alertRuleData) {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query1 = `INSERT INTO AlertRule (alert_rule_id, created_by,
                    updated_by, created_at, alert_rule_name,
                    alert_rule_group, alert_rule_query, alert_rule_duration, alert_rule_severity,
                    alert_rule_description, alert_rule_runbook, alert_rule_summary, alert_rule_state,
                    customer_account_key, resource_group_uuid, alert_rule_health, alert_rule_evaluation_time, alert_rule_last_evaluation
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                      updated_by=VALUES(updated_by),
                      alert_rule_query=VALUES(alert_rule_query),
                      alert_rule_description=VALUES(alert_rule_description),
                      alert_rule_runbook=VALUES(alert_rule_runbook),
                      alert_rule_summary=VALUES(alert_rule_summary),
                      alert_rule_state=VALUES(alert_rule_state),
                      customer_account_key=VALUES(customer_account_key),
                      alert_rule_health=VALUES(alert_rule_health),
                      alert_rule_evaluation_time=VALUES(alert_rule_evaluation_time),
                      alert_rule_last_evaluation=VALUES(alert_rule_last_evaluation)
                      `;
    const query2 = [];
    for (let i = 0; i < alertRuleData.length; i++) {
      query2[i] = [
        alertRuleData[i].alert_rule_id,
        alertRuleData[i].created_by,
        alertRuleData[i].updated_by,
        currentTime,
        alertRuleData[i].alert_rule_name,
        alertRuleData[i].alert_rule_group,
        alertRuleData[i].alert_rule_query,
        alertRuleData[i].alert_rule_duration,
        alertRuleData[i].alert_rule_severity,
        alertRuleData[i].alert_rule_description,
        alertRuleData[i].alert_rule_runbook,
        alertRuleData[i].alert_rule_summary,
        alertRuleData[i].alert_rule_state,
        customerAccountKey,
        alertRuleData[i].resource_group_uuid,
        alertRuleData[i].alert_rule_health,
        alertRuleData[i].alert_rule_evaluation_time,
        new Date(alertRuleData[i].alert_rule_last_evaluation),
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

      console.log('success upload alertRule')
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');

      throw `${err}error on sql execution`;
    }
    await mysqlConnection.end();
  }

  private async upsertAlertReceivedRowQuery(customerAccountKey, alertReceivedData) {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query1 = `INSERT INTO AlertReceived (alert_received_id, customer_account_key, created_by,
                    updated_by, created_at, alert_received_name, alert_rule_key,
                    alert_received_value, alert_received_state, alert_received_namespace, alert_received_severity,
                    alert_received_description, alert_received_summary, alert_received_active_at, alert_received_node,
                    alert_received_service, alert_received_pod, alert_received_instance, alert_received_labels, alert_received_pinned,
                    alert_received_container, alert_received_endpoint, alert_received_reason, alert_received_uid, alert_received_hash, alert_received_ui_flag,
                    alert_received_affected_resource_type, alert_received_affected_resource_name, alert_received_persistentvolumeclaim
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                      alert_received_id = VALUES(alert_received_id)
                      `;
    const query2 = [];
    for (let i = 0; i < alertReceivedData?.length; i++) {
      query2[i] = [
        alertReceivedData[i].alertReceivedId,
        customerAccountKey,
        alertReceivedData[i].createdBy,
        alertReceivedData[i].updatedBy,
        currentTime,
        alertReceivedData[i].alertReceivedName,
        alertReceivedData[i].alertRuleKey,
        alertReceivedData[i].alertReceivedValue,
        alertReceivedData[i].alertReceivedState,
        alertReceivedData[i].alertReceivedNamespace,
        alertReceivedData[i].alertReceivedSeverity,
        alertReceivedData[i].alertReceivedDescription,
        alertReceivedData[i].alertReceivedSummary,
        new Date(alertReceivedData[i].alertReceivedActiveAt),
        alertReceivedData[i].alertReceivedNode,
        alertReceivedData[i].alertReceivedService,
        alertReceivedData[i].alertReceivedPod,
        alertReceivedData[i].alertReceivedInstance,
        JSON.stringify(alertReceivedData[i].alertReceivedLabels),
        alertReceivedData[i].alertReceivedPinned,
        alertReceivedData[i].alertReceivedContainer,
        alertReceivedData[i].alertReceivedEndpoint,
        alertReceivedData[i].alertReceivedReason,
        alertReceivedData[i].alertReceivedUid,
        alertReceivedData[i].alertReceivedHash,
        alertReceivedData[i].alertReceivedUiFlag,
        alertReceivedData[i].alertReceivedAffectedResourceType,
        alertReceivedData[i].alertReceivedAffectedResourceName,
        alertReceivedData[i].alertReceivedPersistentvolumeclaim,
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
      // console.log(query1)
      // console.log(query2)
      await mysqlConnection.query(query1, [query2]);
      await mysqlConnection.query('COMMIT');

      console.log('success upload alertReceived')
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');

      throw `${err}error on sql execution`;
    }
    await mysqlConnection.end();
  }
}

export default AlertRuleService
