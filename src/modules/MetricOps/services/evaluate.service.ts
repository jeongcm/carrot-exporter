import { IBayesianDBModel } from '@/common/interfaces/bayesianModel.interface';
import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { IResource } from '@/common/interfaces/resource.interface';
import { IIncident } from '@/common/interfaces/incident.interface';
import DB from '@/database';
import axios from 'common/httpClient/axios';

import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import IncidentService from '@/modules/Incident/services/incident.service';
import MonitoringTargetService from '@/modules/MetricOps/services/monitoringTarget.service';
import ResolutionActionService from '@/modules/MetricOps/services/resolutionAction.service';
import BayesianModelService from '@/modules/MetricOps/services/bayesianModel.service';
import ModelRuleScoreService from '@/modules/MetricOps/services/modelRuleScore.service';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
import { incidentSeverity, incidentStatus } from '@/common/types/index';
import { IEvaluation } from '@/common/interfaces/evaluate.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';

import executorService from '@/modules/CommonService/services/executor.service';

import { AnomalyMonitoringTargetTable } from '../models/monitoringTarget.model';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';

const { Op } = require('sequelize');

class EvaluateServices {
  public bayesianModel = DB.BayesianModel;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public ruleGroup = DB.RuleGroup;
  public resource = DB.Resource;
  public alertRule = DB.AlertRule;
  public alertReceived = DB.AlertReceived;
  public evaluation = DB.Evaluation;
  public anomalyMonitoringTarget = DB.AnomalyMonitoringTarget;
  public customerAccountService = new CustomerAccountService();
  public monitoringTargetService = new MonitoringTargetService();
  public resolutionActionService = new ResolutionActionService();
  public bayesianModelService = new BayesianModelService();
  public modelRuleScoreService = new ModelRuleScoreService();
  public tableIdService = new TableIdService();
  public incidentService = new IncidentService();
  public executorService = new executorService();
  public resourceGroupService = new ResourceGroupService();
  public partyUser = DB.PartyUser;
  public resolutionAction = DB.ResolutionAction;

  /**
   * Evaluate anomaly using resourceKey
   *
   * @param  {number} resourceKey
   * @returns Promise<object>
   * @author Jerry Lee
   */
  public async evaluateMonitoringTarget(resourceKey: number): Promise<any> {
    const step0 = new Date().getTime();
    console.log('step0 - ', step0);

    let bayesianModel = {};
    let returnResponse = {};
    let bnData = {};
    let evaluationResultStatus;

    // 1. Confirm resource as AnomalyTarget
    const resultMonitoringTarget = await this.monitoringTargetService.findMonitoringTargetsByResourceKeys(resourceKey);
    if (!resultMonitoringTarget) throw new HttpException(400, `Can't find anomaly target - ${resourceKey}`);
    const anomalyMonitoringTargetKey = resultMonitoringTarget.anomalyMonitoringTargetKey;
    const customerAccountKey = resultMonitoringTarget.customerAccountKey;

    const resultResource: IResource = await this.resource.findOne({ where: { resourceKey } });
    if (!resultResource) throw new HttpException(400, `Can't find resource - ${resourceKey}`);

    const resourceType = resultResource.resourceType;
    const resourceName = resultResource.resourceName;
    const resourceId = resultResource.resourceId;

    const step1 = new Date().getTime();
    const elaps1 = (step1 - step0) / 1000;
    console.log('step1 -', elaps1);

    // 2. Pull model to find alert rules
    const bayesianModelKey = resultMonitoringTarget.bayesianModelKey;
    const resultBayesianModel: IBayesianDBModel = await this.bayesianModelService.findBayesianModelByKey(bayesianModelKey);
    const bayesianModelId = resultBayesianModel.bayesianModelId;
    const resourceGroupKey = resultBayesianModel.resourceGroupKey;

    bayesianModel = {
      bayesianModleKey: bayesianModelKey,
      bayesianModleId: bayesianModelId,
      bayesianModelName: resultBayesianModel.bayesianModelName,
    };

    const resultModelRuleScore: IModelRuleScore[] = await this.modelRuleScoreService.getModelScoreByBayesianModelKey(bayesianModelKey);
    const ruleGroupKey = resultModelRuleScore.map(x => x.ruleGroupKey);

    const ruleGroupQuery = {
      where: { ruleGroupKey: { [Op.in]: ruleGroupKey }, deletedAt: null },
    };

    const step2 = new Date().getTime();
    const elaps2 = (step2 - step1) / 1000;
    console.log('step2 -', elaps2);

    const ruleGroup = [];
    const resultRuleGroup = await this.ruleGroup.findAll(ruleGroupQuery);
    for (let i = 0; i < resultRuleGroup.length; i++) {
      ruleGroup[i] = {
        ruleGroupId: resultRuleGroup[i].ruleGroupId,
        ruleGroupKey: resultRuleGroup[i].ruleGroupKey,
        ruleGroupName: resultRuleGroup[i].ruleGroupName,
      };
    }
    const resourceInfo = { resourceKey: resourceKey, resourceId: resourceId, resourceName: resourceName, resourceType: resourceType };
    const revBayesianModel = { bayesianModel, resourceInfo, ruleGroup };

    const step3 = new Date().getTime();
    const elaps3 = (step3 - step2) / 1000;
    console.log('step3 -', elaps3);

    const ruleGroupAlertRule = [];
    const resultRuleGroupList = await this.ruleGroupAlertRule.findAll(ruleGroupQuery);
    const alertRuleKey = resultRuleGroupList.map(x => x.alertRuleKey);

    for (let i = 0; i < resultRuleGroupList.length; i++) {
      ruleGroupAlertRule[i] = {
        ruleGroupKey: resultRuleGroupList[i].ruleGroupKey,
        alertRuleKey: resultRuleGroupList[i].alertRuleKey,
      };
    }

    const revBayesianModel2 = { ...revBayesianModel, ruleGroupAlertRule };

    const step4 = new Date().getTime();
    const elaps4 = (step4 - step3) / 1000;
    console.log('step4 -', elaps4);

    // 3. Find firing alerts received
    let firedAlerts = [];
    const inputAlerts = {};
    console.log('resourceType', resourceType);
    switch (resourceType) {
      case 'ND':
        const alertRuleQueryNd = {
          where: { alertRuleKey: { [Op.in]: alertRuleKey }, deletedAt: null, alertReceivedState: 'firing', alertReceivedNode: resourceName },
        };
        const resultAlertReceived: IAlertReceived[] = await this.alertReceived.findAll(alertRuleQueryNd);
        if (resultAlertReceived.length === 0) {
          firedAlerts = [];
          //console.log ("no firing alert");
          evaluationResultStatus = 'NF';
        } else {
          for (let i = 0; i < resultAlertReceived.length; i++) {
            const alertRuleKey = resultAlertReceived[i].alertRuleKey;
            firedAlerts[i] = {
              alertRuleKey: resultAlertReceived[i].alertRuleKey,
              alertReceivedKey: resultAlertReceived[i].alertReceivedKey,
              alertReceivedId: resultAlertReceived[i].alertReceivedId,
              alertReceivedName: resultAlertReceived[i].alertReceivedName,
              alertReceivedNode: resultAlertReceived[i].alertReceivedNode,
              alertReceivedService: resultAlertReceived[i].alertReceivedService,
              alertReceivedPod: resultAlertReceived[i].alertReceivedPod,
            };
            const resultAlertRule = await this.alertRule.findOne({ where: { alertRuleKey } });
            const alertName = resultAlertReceived[i].alertReceivedName;
            let severity = resultAlertRule.alertRuleSeverity;
            severity = severity.replace(/^./, severity[0].toUpperCase());
            const duration = resultAlertRule.alertRuleDuration;
            const alertName2 = alertName + severity + '_' + duration;
            inputAlerts[alertName2] = 1;
          }
        }
        break;
      case 'SV':
        firedAlerts = [];
        //console.log ("no service alert");
        evaluationResultStatus = 'NF';
        break;
      case 'PD':
        const alertRuleQueryPd = {
          where: { alertRuleKey: { [Op.in]: alertRuleKey }, deletedAt: null, alertReceivedState: 'firing', alertReceivedPod: resourceName },
        };
        const resultAlertReceivedPd: IAlertReceived[] = await this.alertReceived.findAll(alertRuleQueryPd);
        if (resultAlertReceivedPd.length === 0) {
          firedAlerts = [];
          //console.log ("no firing alert");
          evaluationResultStatus = 'NF';
        } else {
          //console.log('resultAlertReceivedPd', resultAlertReceivedPd);
          for (let i = 0; i < resultAlertReceivedPd.length; i++) {
            const alertRuleKey = resultAlertReceivedPd[i].alertRuleKey;
            firedAlerts[i] = {
              alertRuleKey: resultAlertReceivedPd[i].alertRuleKey,
              alertReceivedKey: resultAlertReceivedPd[i].alertReceivedKey,
              alertReceivedId: resultAlertReceivedPd[i].alertReceivedId,
              alertReceivedName: resultAlertReceivedPd[i].alertReceivedName,
              alertReceivedNode: resultAlertReceivedPd[i].alertReceivedNode || '',
              alertReceivedService: resultAlertReceivedPd[i].alertReceivedService || '',
              alertReceivedPod: resultAlertReceivedPd[i].alertReceivedPod,
            };
            const resultAlertRule = await this.alertRule.findOne({ where: { alertRuleKey } });
            const alertName = resultAlertReceivedPd[i].alertReceivedName;
            let severity = resultAlertRule.alertRuleSeverity;
            severity = severity.replace(/^./, severity[0].toUpperCase());
            const duration = resultAlertRule.alertRuleDuration;
            const alertName2 = alertName + severity + '_' + duration;
            inputAlerts[alertName2] = 1;
          }
        }
        break;
      case 'SS' || 'DP':
        firedAlerts = [];
        //console.log ("no service alert");
        evaluationResultStatus = 'NF';
        break;
    }

    returnResponse = { ...revBayesianModel2, firedAlerts, inputAlerts };

    const step5 = new Date().getTime();
    const elaps5 = (step5 - step4) / 1000;
    console.log('step5 -', elaps5);

    // 4. Save the request map to the db
    //use uuid instead of tableid due to performance reason
    //const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('Evaluation');
    //const evaluationId: string = responseTableIdData.tableIdFinalIssued;
    //console.log (evaluationId);
    const uuid = require('uuid');
    const evaluationId = uuid.v1();

    const step51 = new Date().getTime();
    const elaps51 = (step51 - step5) / 1000;
    console.log('step5.1 -', elaps51);

    const createEvaluation = {
      evaluationId: evaluationId,
      createdAt: new Date(),
      createdBy: 'SYSTEM',
      requestedAt: new Date(),
      evaluationRequest: returnResponse,
      evaluationResultStatus: evaluationResultStatus,
      anomalyMonitoringTargetKey: anomalyMonitoringTargetKey,
      customerAccountKey: customerAccountKey,
      bayesianModelKey: bayesianModelKey,
      resourceGroupKey: resourceGroupKey,
      evaluationStatus: 'RQ',
    };

    const resultEvaluationRequest: IEvaluation = await this.evaluation.create(createEvaluation);
    //console.log ("created evaluation request: ", resultEvaluationRequest.evaluationId);

    const step6 = new Date().getTime();
    const elaps6 = (step6 - step5) / 1000;
    console.log('step6 -', elaps6);

    if (evaluationResultStatus === 'NF') {
      returnResponse = {
        evaluationId: evaluationId,
        evaluationResultStatus: evaluationResultStatus,
        evaluationResult: '',
        resourceName: resourceName,
        resourceId: resourceId,
      };
      console.log('total elaps: ', elaps1 + elaps2 + elaps3 + elaps4 + elaps5 + elaps6);
      return returnResponse;
    }

    // 5. Call NexClipper BN
    bnData = {
      evaluationId: evaluationId,
      bayesianModelId: bayesianModelId,
      inputAlerts: inputAlerts,
    };

    const url = config.ncBnApiDetail.ncBnUrl + config.ncBnApiDetail.ncBnNodePath;
    let evaluationResult;
    console.log('bnData', bnData);
    await axios({
      method: 'post',
      url: url,
      data: bnData,
      //headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
    })
      .then(async (res: any) => {
        const statusCode = res.status;
        if (statusCode != 200) {
          //console.log("result is not ready");
          return res;
        }
        evaluationResult = res.data;
        console.log(res.data);
        //console.log(`got evaluation result -- ${evaluationResult}`);
      })
      .catch(error => {
        //console.log(error);
        const updateError = {
          evaluationStatus: 'FA',
          evaluated_at: new Date(),
          updated_at: new Date(),
          updated_by: 'SYSTEM',
        };
        const updateErrorWhere = {
          where: { evaluationId: evaluationId },
        };
        console.log(error);
        const resultEvaluationResult = this.evaluation.update(updateError, updateErrorWhere);
        throw new HttpException(500, `Unknown error to fetch the result of evaluation from nexclipper-bn: ${evaluationId}`);
      });

    const step7 = new Date().getTime();
    const elaps7 = (step7 - step6) / 1000;
    console.log('step7 -', elaps7);

    const predictedScore = evaluationResult.predicted_score;
    console.log('predictedScore: ', predictedScore);
    const nodeThreshold = Number(config.ncBnApiDetail.ncBnNodeThreshold);
    const podThreshold = Number(config.ncBnApiDetail.ncBnNodeThreshold);

    // need to improve to process pod
    if (resourceType === 'ND') {
      if (predictedScore >= nodeThreshold) {
        evaluationResultStatus = 'AN';
      } else {
        evaluationResultStatus = 'OK';
      }
    } else if (resourceType === 'PD') {
      if (predictedScore >= podThreshold) {
        evaluationResultStatus = 'AN';
      } else {
        evaluationResultStatus = 'OK';
      }
    } else evaluationResultStatus = 'OK'; // add the logic when workload will be added.

    const updateData = {
      evaluationResult: evaluationResult,
      //hardcoded for testing. need to read evalatuon result once Shawn's API is ready
      evaluationResultStatus: evaluationResultStatus,
      evaluationStaus: 'EX',
      evaluated_at: new Date(),
      updated_at: new Date(),
      updated_by: 'SYSTEM',
    };

    const updateWhere = {
      where: { evaluationId: evaluationId },
    };

    // 6. Save the results to the database
    const resultEvaluationResult = await this.evaluation.update(updateData, updateWhere);
    const resultEvaluation: IEvaluation = await this.evaluation.findOne({ where: { evaluationId } });

    returnResponse = {
      evaluationId: evaluationId,
      resourceName: resourceName,
      resourceId: resourceId,
      evaluationResultStatus: evaluationResultStatus,
      evaluationRequest: resultEvaluation.evaluationRequest,
      evaluationResult: evaluationResult,
      resourceType: resourceType,
    };
    // 7. Return the evaluation result back to caller

    const step8 = new Date().getTime();
    const elaps8 = (step8 - step7) / 1000;
    console.log('step8 -', elaps8);
    console.log('total elaps: ', elaps1 + elaps2 + elaps3 + elaps4 + elaps5 + elaps6 + elaps7 + elaps8);

    return returnResponse;
  }
  /**
   * Trigger evaluation process by customerAccountId
   *
   * @param  {string} customerAccountId
   * @returns Promise<object>
   * @author Jerry Lee
   */

  public async initiateEvaluationProcess(customerAccountId: string, userId: string): Promise<any> {
    console.log('STEP1');
    //1. validate customerAccountid
    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);
    if (!resultCustomerAccount) throw new HttpException(400, `Can't find customerAccount - ${customerAccountId}`);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    console.log('STEP2');
    //2. pull monitoring targets
    const resultMonitoringTarget: IAnomalyMonitoringTarget[] = await this.monitoringTargetService.findMonitoringTargetsByCustomerAccountKey(
      customerAccountKey,
    );
    if (!resultMonitoringTarget) throw new HttpException(401, `Can't find AnomalyTarget - ${customerAccountId}`);

    console.log('STEP3');
    //3. call evaluateMonitorintTarget (ML)
    //console.log('resultMonitoringTarget', resultMonitoringTarget);
    const resultReturn = {};
    for (let i = 0; i < resultMonitoringTarget.length; i++) {
      const resourceKey = resultMonitoringTarget[i].resourceKey;

      let resultEvaluation = await this.evaluateMonitoringTarget(resourceKey);
      const { evaluationRequest, evaluationResult, evaluationResultStatus, evaluationId, resourceId, resourceName, resourceType } = resultEvaluation;
      console.log(`evaluationResultStatus------${evaluationResultStatus}`);

      if (evaluationResultStatus === 'AN') {
        console.log('STEP4 - ANOMALY');
        //4.1. bring resource namespace, if pod, bring prometheus address from resourceGroup
        const getResource = await this.resource.findOne({
          where: { resourceId: resourceId },
          attributes: ['resourceNamespace'],
          include: [
            {
              model: ResourceGroupModel,
              as: 'ResourceGroup',
              attributes: ['resourceGroupPrometheus', 'resourceGroupUuid'],
            },
          ],
        });
        const resourceNamespace = getResource.resourceNamespace;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const prometheusUrl = getResource.dataValues.ResourceGroup.dataValues.resourceGroupPrometheus;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const clusterUuid = getResource.dataValues.ResourceGroup.dataValues.resourceGroupUuid;
        console.log('prometheusUrl', prometheusUrl);
        console.log('clusterUuid', clusterUuid);
        //4.2. if any anomaly, create incident ticket
        const incidentData = {
          incidentName: `MetricOps: ${JSON.stringify(resultEvaluation.evaluationRequest.bayesianModel.bayesianModelName)}`,
          incidentDescription: `MetricOps: evaluation Id ${JSON.stringify(resultEvaluation.evaluationResult.evaluation_id)}`,
          incidentStatus: 'OP' as incidentStatus,
          incidentSeverity: 'UR' as incidentSeverity,
          incidentDueDate: null,
          assigneeId: '',
        };
        const resultIncidentCreate: IIncident = await this.incidentService.createIncident(customerAccountKey, userId, incidentData);
        const incidentId = resultIncidentCreate.incidentId;
        const firedAlerts = resultEvaluation.evaluationRequest.firedAlerts;
        const firedAlertList = firedAlerts.map(a => a.alertReceivedId);
        const alertReceivedIds = { alertReceivedIds: firedAlertList };

        console.log('STEP5');
        //5. attach the alerts (from the result) to the incident tickets
        await this.incidentService.addAlertReceivedtoIncident(customerAccountKey, incidentId, alertReceivedIds, userId);
        console.log(`incident ticket is created: ', ${incidentId}, 'Alert Attached - ', ${alertReceivedIds}`);

        console.log('STEP6');
        //6. execute any resolution actions if there are actions under rule group more than a threshold
        const nodeThreshold = Number(config.ncBnApiDetail.ncBnNodeThreshold);
        const podThreshold = Number(config.ncBnApiDetail.ncBnPodThreshold);

        const ruleGroup = [];
        Object.entries(evaluationResult.alert_group_score).filter(([key, value]) => {
          const ruleValue = Number(value);
          if (resourceType == 'ND') {
            if (ruleValue >= nodeThreshold) {
              ruleGroup.push(key);
            }
          } else if (resourceType == 'PD') {
            if (ruleValue >= podThreshold) {
              ruleGroup.push(key);
            } // TODO - else - for workload case later
          }
        });
        //console.log(`ruleGroup===================, ${ruleGroup}`);
        //console.log('evaluationRequest=============', evaluationRequest);
        console.log('RuleGroup:-----------', evaluationRequest.ruleGroup);
        for (let i = 0; evaluationRequest.ruleGroup.length; i++) {
          console.log('STEP7');
          const resolutionActions = await this.resolutionActionService.getResolutionActionByRuleGroupId(evaluationRequest.ruleGroup[i].ruleGroupId);

          resolutionActions.length &&
            resolutionActions.map(async (resolutionAction: any) => {
              //7. postExecuteService to sudory server
              const currentDate = new Date();
              const start = new Date(currentDate.setHours(currentDate.getHours() - 2)).toISOString().substring(0.19);
              const subscribed_channel = config.sudoryApiDetail.channel_webhook;
              const end = currentDate.toISOString().substring(0.19);
              const templateUuid = resolutionAction.sudoryTemplate.sudoryTemplateUuid;

              // replace variables of ResolutionAction Query
              let steps = JSON.stringify(resolutionAction.resolutionActionTemplateSteps);
              steps = steps.replace('#namespace', resourceNamespace);
              steps = steps.replace('#prometheusurl', prometheusUrl);
              steps = steps.replace('#resourcename', resourceName);
              steps = steps.replace('#name', resourceName);
              steps = steps.replace('#start', start);
              steps = steps.replace('#end', end);
              steps = JSON.parse(steps);
              const stepsEnd = [{ args: steps }];
              console.log('Sudory STEPS', JSON.stringify(stepsEnd));

              const serviceOutput: any = await this.executorService.postExecuteService(
                `METRICOPS-${resolutionAction?.resolutionActionName}/:CUST-${customerAccountKey}/:INC-${incidentId}`,
                `INC-${incidentId}`,
                clusterUuid,
                templateUuid,
                stepsEnd,
                customerAccountKey,
                subscribed_channel,
              );
            });
        }

        //8. save the communicaiton result to notification table

        //9. create a message for return
        resultEvaluation = {
          evaluationId,
          evaluationResultStatus,
          evaluationResult,
          resourceId,
          resourceName,
          incidentId,
          ruleGroup,
        };
      } else {
        resultEvaluation = {
          evaluationId,
          evaluationResultStatus,
          resourceId,
          resourceName,
          incidentId: '',
          evaluationResult,
        };
      }
      resultReturn[i] = resultEvaluation;
    }
    return resultReturn;
  }

  /**
   * Get evaluation result by customerAccountId
   *
   * @param  {string} customerAccountId
   * @returns Promise<IEvaluation[]>
   * @author Jerry Lee
   */
  public async getEvaluationHistoryAll(customerAccountId: string): Promise<IEvaluation[]> {
    //1. validate CustomerAccount
    const resultCustomerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);
    if (!resultCustomerAccount) throw new HttpException(400, `Can't find customer Account - ${customerAccountId}`);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;
    //2. pull evaluation history
    const queryCondition = {
      where: {
        deletedAt: null,
        customerAccountKey: customerAccountKey,
      },
      include: [
        {
          model: ResourceGroupModel,
          attributes: ['resourceGroupName', 'resourceGroupId'],
        },
        {
          model: AnomalyMonitoringTargetTable,
        },
      ],
    };
    const resultEvaluation: IEvaluation[] = await this.evaluation.findAll(queryCondition);

    return resultEvaluation;
  }

  /**
   * Get evaluation result by anomalyMonitoringTargetId
   *
   * @param  {string} anomalyMonitoringTargetId
   * @returns Promise<IEvaluation[]>
   * @author Shrishti Raj
   */
  public async getEvaluationHistoryByTargetId(anomalyMonitoringTargetId: string): Promise<IEvaluation[]> {
    //1. validate AnomalyMonitoringTarget
    const resultAnomalyMonitoringTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.findOne({
      where: { anomalyMonitoringTargetId },
    });
    if (!resultAnomalyMonitoringTarget) throw new HttpException(400, `Can't find Anomaly Target - ${anomalyMonitoringTargetId}`);
    const anomalyMonitoringTargetKey = resultAnomalyMonitoringTarget.anomalyMonitoringTargetKey;

    //2. pull evaluation history
    const queryCondition = {
      where: {
        deletedAt: null,
        anomalyMonitoringTargetKey,
      },
    };
    const resultEvaluation: IEvaluation[] = await this.evaluation.findAll(queryCondition);
    return resultEvaluation;
  }

  /**
   * Get evaluation result by Id
   *
   * @param  {string} evaluationId
   * @returns Promise<IEvaluation>
   * @author Jerry Lee
   */
  public async getEvaluationHistoryById(evaluationId: string): Promise<IEvaluation> {
    const queryCondition = {
      where: {
        deletedAt: null,
        evaluationId: evaluationId,
      },
      include: [
        {
          model: ResourceGroupModel,
          attributes: ['resourceGroupName', 'resourceGroupId'],
        },
        {
          model: AnomalyMonitoringTargetTable,
        },
      ],
    };
    const resultEvaluation: IEvaluation = await this.evaluation.findOne(queryCondition);
    if (!resultEvaluation) throw new HttpException(400, `Can't find Evaluation result - ${evaluationId}`);
    return resultEvaluation;
  }
}

export default EvaluateServices;
