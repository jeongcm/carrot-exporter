import { HttpException } from "@common/exceptions/HttpException";
import DB from "@/database";
import { IResourceGroup } from "@common/interfaces/resourceGroup.interface";
import sequelize, { Op, where } from "sequelize";
import * as crypto from "crypto";
import config from "@/config";
import mysql from "mysql2/promise";
import axios from "@common/httpClient/axios";
import TableIdService from "@common/tableId/tableId";

class AlertRuleService {
  public tableIdService = new TableIdService()
  public resourceGroup = DB.ResourceGroup;
  public alertRule = DB.AlertRule;
  public alertReceived = DB.AlertReceived;

  public async uploadAlertRule(totalMsg) {
    // 기본 변수
    const serviceUuid = totalMsg.service_uuid
    const clusterUuid = totalMsg.cluster_uuid
    const status = totalMsg.status
    const Result = totalMsg.result
    const inputs = totalMsg.input
    if (serviceUuid === '') {
      throw new HttpException(404, 'not found service uuid')
    }

    if (clusterUuid === '') {
      throw new HttpException(404, 'not found cluster uuid')
    }


  }

  private async getAlertRuleByClusterUuid(clusterUuid) {
    let result = []
    let alertRules: any = await this.alertRule.findAll({
      attributes: [
        'alert_rule_key',
        [sequelize.fn('SHA1', sequelize.fn('CONCAT', sequelize.col('alert_rule_group'), '.', sequelize.col('alert_rule_name'), '.', sequelize.col('alert_rule_severity'), '.', sequelize.col('alert_rule_duration'))), 'sha1']
      ],
      where: {
        deletedAt: null,
        resourceGroupUuid: clusterUuid
      }
    });
    alertRules.forEach(alertRule => result.push({
      id: alertRule.alertRuleKey,
      SHA1: alertRule.SHA1
    }))

    return result
  }

  private async SHA1(b) {
    const h = crypto.createHash('sha1');
    h.update(b);

    return h.digest();
  }

  private async alertReceivedToSHA1(alertReceived: any): Promise<string> {
    let result: string
    let list = [alertReceived.alertRuleKey.toString(), alertReceived.alertReceivedLabels]
    let value = list.join('.')

    let bytesData = Buffer.from(value, 'utf8')

    let hashResult = await this.SHA1(bytesData)
    result = hashResult.toString('hex')

    return result
  }

  private async alertRuleToSHA1(alertRule: any): Promise<string> {
    let result: string
    let list = [alertRule.alertRuleGroup, alertRule.alertRuleName, alertRule.alertRuleSeverity, alertRule.alertRuleDuration.toString()]
    let value = list.join('.')

    let bytesData = Buffer.from(value, 'utf8')

    let hashResult = await this.SHA1(bytesData)
    result = hashResult.toString('hex')

    return result
  }

  private getAlertRuleKey(prevAlertRuleUniqueSet: {}, alertRuleHash: any): number {
    return prevAlertRuleUniqueSet[alertRuleHash]
  }
  private async processAlertRule(serviceUuid, clusterUuid, result) {
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
      prevAlertRules.forEach(prevAlertRule => prevAlertRuleUniqueSet[prevAlertRule.SHA1] = prevAlertRule.id)

      let prevAlertReceives: any // 이전에만 존재하던 alertReceived list
      let prevAlertReceivedSet: any = {} // 이전에만 존재하는 alertReceived map
      let prevAlertReceivedIntersectionSet: any = {} // 이전과 새로운 데이터 모두 존재하는 alertReceived map
      if (prevAlertRuleUniqueSet.length > 0) {
        let prevAlertRuleIds = prevAlertRuleUniqueSet.map(ar => ar.id)

        prevAlertReceives = await this.alertReceived.findAll({where: {
          deletedAt: null,
          alertRuleKey: {[Op.in]: prevAlertRuleIds }
        }})

        // 이전 alertReceived 가 존재하면 alertReceived hashing 해서 key value 로 저장
        for (let prevAlertReceived of prevAlertReceives) {
          let hash = await this.alertReceivedToSHA1(prevAlertReceived)
          prevAlertReceivedSet[hash] = prevAlertReceived;
        }
      }

      let alertRuleSet: any = {} // 새로 들어온 alertRule map
      let newAlertReceivedSet: any = {}
      for (let group of result.groups) {
        for (let rule of group.rules) {
          if (rule.Labels["serverity"] === "none" || rule.Labels["serverity"] === "") {
            continue
          }

          let alertRule = this.getAlertRuleQuery(clusterUuid, group.name, resourceGroup.customerAccountKey, rule)
          let alertRuleHash = await this.alertRuleToSHA1(alertRule) // make hash

          // alertRuleKey setting
          if (typeof this.getAlertRuleKey(prevAlertRuleUniqueSet, alertRuleHash) !== 'undefined') {
            alertRule["alert_rule_key"] = this.getAlertRuleKey(prevAlertRuleUniqueSet, alertRuleHash)
          }

          alertRule["updated_by"] = config.partyUser.userId // editor
          alertRuleSet[alertRuleHash] = alertRule
          // alertReceived

          for (let alert of rule.Alerts) {
            let alertReceived = this.getAlertReceivedQuery(alertRule["alert_rule_key"], resourceGroup.customerAccountKey, alert) // get alertReceived query

            let alertReceivedHash = await this.alertReceivedToSHA1(alertReceived) // make alertReceived hash
            alertReceived["updated_by"] = config.partyUser.userId // editor

            // 이전 alertReceived에 존재한다면
            if (prevAlertReceivedSet[alertReceivedHash]) {
              // 이전과 새로운 데이터를 모두 가진 alertReceived map에 얼럿 추가
              prevAlertReceivedIntersectionSet[alertReceivedHash] = prevAlertReceivedSet[alertReceivedHash]
            }

            // 모두 가진 alertReceived map에 넣었기 때문에 이전 얼럿 삭제
            delete prevAlertReceivedSet[alertReceivedHash]

            newAlertReceivedSet[alertRuleHash][alertReceivedHash] = alertReceived
          }
        }
      }

      // 2. upsert to database

      // 필터 함수를 통해서 alertRuleSet에 이전 얼럿 룰이 존재한다면 삭제하지 않고 존재하지 않으면 삭제 처리
      const unUsedAlertRuleKeys = this.setUniqueValues(prevAlertRuleUniqueSet, (k, v) => {
        if (alertRuleSet.hasOwnProperty(k)) {
          return false;
        }

        for (const ar of newAlertReceivedSet[k]) {
          ar.AlertReceivedState = "resolved";
        }

        return true;
      });

      if (unUsedAlertRuleKeys.length > 0) {
        // delete unused alertRule
        await this.alertRule.destroy({where: {
          alertRuleKey: {[Op.in]: unUsedAlertRuleKeys}
          }})
      }

      let arrivalAlertRules = []
      let updatableAlertRules = []
      let combinedAlertRules = []
      for (const alertRuleValue of alertRuleSet) {
        if (typeof alertRuleValue["alert_rule_key"] === 'undefined') {
          alertRuleValue['created_by'] = config.partyUser.userId
          arrivalAlertRules.push(alertRuleValue)
        } else {
          updatableAlertRules.push(alertRuleValue)
        }

        if (alertRuleValue['alert_rule_state'] === 'inactive') {
          let alertRuleHash = await this.alertRuleToSHA1(alertRuleValue)
          newAlertReceivedSet[alertRuleHash].forEach(alertReceived => {
            alertReceived['alert_received_state'] = 'resolved'
          })
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
            arrivalAlertRules[index].alertRuleId = tableId
          })

          combinedAlertRules.push(...arrivalAlertRules)
        }


        if (updatableAlertRules.length > 0) {
          combinedAlertRules.push(...updatableAlertRules)
        }

        if (combinedAlertRules.length > 0) {
          await this.alertRule.bulkCreate(combinedAlertRules, {
            updateOnDuplicate: ["updatedAt", "alertRuleQuery", "alertRuleDescription", "alertRuleRunbook",
              "alertRuleSummary", "alertRuleState", "customerAccountKey",
              "alertRuleHealth", "alertRuleEvaluationTime", "alertRuleLastEvaluation"],
          })
        }

      // 새로 생성한 alertRule list uniqueSet 추가
      prevAlertRules = await this.getAlertRuleByClusterUuid(clusterUuid)

      prevAlertRules.forEach(prevAlertRule => prevAlertRuleUniqueSet[prevAlertRule.SHA1] = prevAlertRule.id)

      // 이전 alertReceived 삭제

      if (prevAlertReceives.length > 0) {
        let newAlertReceivedMap = {}
        newAlertReceivedSet.forEach((alertReceivedMap, k) => {
          alertReceivedMap.forEach((alertReceived, alertReceivedHash) => {
            newAlertReceivedMap[alertReceivedHash] = alertReceived
          })
        })

        let alertReceivedKeys = [];
        for (const prevAlertReceived of prevAlertReceives) {
          // 1. 이전에 존재했지만 이번에 없어진 데이터
          //   - AlertReceivedState가 이전에 "resolved" 인 데이터 삭제 안함
          // 2. 이전에 존재했고 이번에도 존재하는 데이터
          //   - AlertReceivedState가 이전에 "resolved" 이고 이번에도 "resolved"이면 삭제 안함
          if (prevAlertReceived.alertReceivedState === 'resolved') {
            let arHash = await this.alertReceivedToSHA1(prevAlertReceived)
            let resolvedAlertReceived = newAlertReceivedMap[arHash]
            if (!resolvedAlertReceived) {
              continue
            } else {
              if (resolvedAlertReceived.alertReceivedState === 'resolved') {
                continue
              }
            }
          }

          alertReceivedKeys.push(prevAlertReceived.alertReceivedKey)
        }

        await this.alertReceived.destroy({where: {
          alertRuleKey: {[Op.in]: alertReceivedKeys}
        }})
      }


      if (prevAlertReceivedSet.length > 0 || newAlertReceivedSet.length > 0) {
        let insertAlertReceives: any = []

        // 새로운 AlertReceived 추가
        // - 이전 AlertReceived가 존재하고 이전 AlertReceivedState가 "resolved"이면서 새로운 상태도 "resolved"이면 추가 안함
        for (const [alertRuleHash, alertReceivedSet] of newAlertReceivedSet) {
          for (const alertReceived of alertReceivedSet) {
            let arHash = await this.alertReceivedToSHA1(alertReceived)
            let inAlertReceived = prevAlertReceivedIntersectionSet[arHash]
            if (inAlertReceived && (inAlertReceived.AlertReceivedState == 'resolved' && alertReceived.AlertReceivedState == 'resolved')) {
                continue
            }

            alertReceived.alertRuleKey = prevAlertRuleUniqueSet[alertRuleHash]
            alertReceived.createdBy = config.partyUser.userId
            insertAlertReceives.push(alertReceived)
          }
        }

        // 이전 AlertReceived 중 이번에 없어진 AlertReceived에 대해
        // 이전 AlertReceivedState가 "resolved"가 아니라면 "resolved"로 변경해서 추가
        prevAlertReceivedSet.forEach(prevAlertReceived => {
          if (prevAlertReceived.alertReceivedState != 'resolved') {
            prevAlertReceived.alertRuleKey = null
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

          await this.alertReceived.bulkCreate(insertAlertReceives)
        }
      }





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
    ruleQuery['alert_rule_duration'] = rule.duration.toInt()
    ruleQuery['alert_rule_severity'] = rule.labels["severity"]
    ruleQuery['alert_rule_description'] = rule.annotations["description"]
    ruleQuery['alert_rule_runbook'] = rule.annotations["runbook_url"]
    ruleQuery['alert_rule_summary'] = rule.annotations["summary"]
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

    receivedQuery['alert_received_name'] = received.labels["alertname"]
    receivedQuery['alert_received_severity'] = received.labels["severity"]
    receivedQuery['alert_received_state'] = received.state
    receivedQuery['alert_received_description'] = received.annotaions["description"]
    receivedQuery['alert_received_summary'] = received.annotaions["summary"]
    receivedQuery['alert_received_active_at'] = received.activedAt
    receivedQuery['alert_received_value'] = parseFloat(received.value)
    receivedQuery['alert_received_namespace'] = received.labels["namespace"]
    receivedQuery['alert_received_node'] = received.labels["node"]
    receivedQuery['alert_received_service'] = received.labels["service"]
    receivedQuery['alert_received_pod'] = received.labels["pod"]
    receivedQuery['alert_received_persistentvolumeclaim'] = received.labels["persistentvolumeclaim"]
    receivedQuery['alert_received_pinned'] = 0
    receivedQuery['customer_account_key'] = customerAccountKey
    receivedQuery['alert_rule_key'] = ruleKey
    receivedQuery['alert_received_instance'] = received.labels["instance"]
    receivedQuery['alert_received_labels'] = received.labels
    receivedQuery['alert_received_container'] = received.labels["container"]
    receivedQuery['alert_received_endpoint'] = received.labels["endpoint"]
    receivedQuery['alert_received_reason'] = received.labels["reason"]
    receivedQuery['alert_received_uid'] = received.labels["uid"]
    receivedQuery['alert_received_affected_resource_type'] = "NA";
    receivedQuery['alert_received_affected_resource_name'] = "NA";

    return receivedQuery
  }

  private setUniqueValues(set, filter) {
    const r = [];
    set.forEach((v, k) => {
      if (filter(k, v)) {
        r.push(v);
      }
    });
    return r;
  }
}

export default AlertRuleService
