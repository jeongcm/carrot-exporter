import { IBayesianDBModel } from '@/common/interfaces/bayesianModel.interface';
import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { IResource } from '@/common/interfaces/resource.interface';
import { IIncident } from '@/common/interfaces/incident.interface';
import DB from '@/database';
import axios from 'common/httpClient/axios';
import { QueryTypes } from 'sequelize';

import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import TableIdService from '@/modules/CommonService/services/tableId.service';
//import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
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
import { IncidentModel } from '@/modules/Incident/models/incident.model';

import executorService from '@/modules/CommonService/services/executor.service';

import { AnomalyMonitoringTargetTable } from '../models/monitoringTarget.model';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import { IResolutionAction } from '@/common/interfaces/resolutionAction.interface';
import sequelize from 'sequelize';
import { IExecutorService } from '@/common/interfaces/executor.interface';
import { ResourceRawDto } from '@/modules/Resources/dtos/resource.dto';
import { resultEvaluationDto } from '../dtos/evaluate.dto';
import { IPartyUser } from '@/common/interfaces/party.interface';

const { Op } = require('sequelize');

class EvaluateServices {
  public bayesianModel = DB.BayesianModel;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public ruleGroup = DB.RuleGroup;
  public resource = DB.Resource;
  public alertRule = DB.AlertRule;
  public alertReceived = DB.AlertReceived;
  public evaluation = DB.Evaluation;
  public customerAccount = DB.CustomerAccount;
  public executorServiceDB = DB.ExecutorService;
  public anomalyMonitoringTarget = DB.AnomalyMonitoringTarget;
  //public customerAccountService = new CustomerAccountService();
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
  public incident = DB.Incident;

  /**
   * Evaluate anomaly using resourceKey
   *
   * @param  {string} anomalyMonitoringTargetId
   * @param  {string} anomalyMonitoringTargetResourceId
   * @returns Promise<any>
   * @author Jerry Lee
   */
  public async evaluateMonitoringTarget(anomalyMonitoringTargetId: string, anomalyMonitoringTargetResourceId: string): Promise<resultEvaluationDto> {
    console.log('#METRICOPS- anomalyMonitoringTargetId', anomalyMonitoringTargetId);
    const step0 = new Date().getTime();
    console.log('#METRICOPS step0 - ', step0);

    let bayesianModel = {};
    let returnResponse;
    let bnData = {};
    let evaluationResultStatus = 'IN';

    // 1. Confirm resource as AnomalyTarget
    const resultMonitoringTarget = await this.monitoringTargetService.findMonitoringTargetById(anomalyMonitoringTargetId);
    if (!resultMonitoringTarget) throw new HttpException(400, `Can't find anomaly target - ${anomalyMonitoringTargetId}`);
    const anomalyMonitoringTargetKey = resultMonitoringTarget.anomalyMonitoringTargetKey;
    const customerAccountKey = resultMonitoringTarget.customerAccountKey;

    const resultResource: IResource = await this.resource.findOne({ where: { resourceId: anomalyMonitoringTargetResourceId } });
    if (!resultResource) throw new HttpException(400, `Can't find resource - ${anomalyMonitoringTargetResourceId}`);
    const resourceKey = resultResource.resourceKey;

    const resourceType = resultResource.resourceType;
    const resourceLevel4 = resultResource.resourceLevel4;
    const resourceName = resultResource.resourceName;
    const resourceId = resultResource.resourceId;
    console.log('#METRICOPS - resourceName', resourceName);
    const step1 = new Date().getTime();
    const elaps1 = (step1 - step0) / 1000;
    console.log('#METRICOPS step1 -', elaps1 + ' ' + resourceName);

    // 2. Pull model to find alert rules
    const bayesianModelKey = resultMonitoringTarget.bayesianModelKey;
    const resultBayesianModel: IBayesianDBModel = await this.bayesianModelService.findBayesianModelByKey(bayesianModelKey);
    const bayesianModelId = resultBayesianModel.bayesianModelId;
    //if this model has a standard model id, use the standard model id instead of bayesian model id
    let bayesianModelIdForBn;
    if (resultBayesianModel?.standardModelId) {
      bayesianModelIdForBn = resultBayesianModel.standardModelId;
    } else {
      bayesianModelIdForBn = resultBayesianModel.bayesianModelId;
    }
    const resourceGroupKey = resultBayesianModel.resourceGroupKey;

    bayesianModel = {
      bayesianModelKey: bayesianModelKey,
      bayesianModelId: bayesianModelId,
      bayesianModelName: resultBayesianModel.bayesianModelName,
    };

    const resultModelRuleScore: IModelRuleScore[] = await this.modelRuleScoreService.getModelScoreByBayesianModelKey(bayesianModelKey);
    const ruleGroupKey = resultModelRuleScore.map(x => x.ruleGroupKey);
    //console.log('ruleGroupKey----', JSON.stringify(ruleGroupKey));
    const ruleGroupQuery = {
      where: { ruleGroupKey: { [Op.in]: ruleGroupKey }, deletedAt: null },
    };

    const step2 = new Date().getTime();
    const elaps2 = (step2 - step1) / 1000;
    console.log('#METRICOPS step2 -', elaps2 + ' ' + resourceName);

    const ruleGroup = [];
    const resultRuleGroup = await this.ruleGroup.findAll(ruleGroupQuery);
    for (let i = 0; i < resultRuleGroup.length; i++) {
      ruleGroup[i] = {
        ruleGroupId: resultRuleGroup[i].ruleGroupId,
        ruleGroupKey: resultRuleGroup[i].ruleGroupKey,
        ruleGroupName: resultRuleGroup[i].ruleGroupName,
      };
    }
    const resourceInfo = {
      resourceKey: resourceKey,
      resourceId: resourceId,
      resourceName: resourceName,
      resourceType: resourceType,
      resourceLevel4: resourceLevel4,
    };
    const revBayesianModel = { bayesianModel, resourceInfo, ruleGroup };

    const step3 = new Date().getTime();
    const elaps3 = (step3 - step2) / 1000;
    console.log('#METRICOPS step3 -', elaps3 + ' ' + resourceName);

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
    console.log('#METRICOPS step4 -', elaps4 + ' ' + resourceName);

    // 3. Find firing alerts received
    let firedAlerts = [];
    const inputAlerts = {};
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
              alertReceivedService: resultAlertReceived[i].alertReceivedService || '',
              alertReceivedPod: resultAlertReceived[i].alertReceivedPod || '',
              alertReceivedPersistentvolume: resultAlertReceived[i].alertReceivedPersistentvolumeclaim || '',
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
        //loop to find firing alerts on the each pods
        const alertRuleQueryPd = {
          where: { alertRuleKey: { [Op.in]: alertRuleKey }, deletedAt: null, alertReceivedState: 'firing', alertReceivedPod: resourceName },
        };
        const resultAlertReceivedPd: IAlertReceived[] = await this.alertReceived.findAll(alertRuleQueryPd);
        if (resultAlertReceivedPd.length === 0) {
          firedAlerts = [];
          //console.log ("no firing alert");
          evaluationResultStatus = 'NF';
        } else {
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
              alertReceivedPersistentvolume: resultAlertReceivedPd[i].alertReceivedPersistentvolumeclaim || '',
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
      case 'PC':
        const alertRuleQueryPc = {
          where: {
            alertRuleKey: { [Op.in]: alertRuleKey },
            deletedAt: null,
            alertReceivedState: 'firing',
            alertReceivedPersistentvolumeclaim: resourceName,
          },
        };
        const resultAlertReceivedPc: IAlertReceived[] = await this.alertReceived.findAll(alertRuleQueryPc);
        if (resultAlertReceivedPc.length === 0) {
          firedAlerts = [];
          //console.log ("no firing alert");
          evaluationResultStatus = 'NF';
        } else {
          //console.log('resultAlertReceivedPd', resultAlertReceivedPd);
          for (let i = 0; i < resultAlertReceivedPc.length; i++) {
            const alertRuleKey = resultAlertReceivedPc[i].alertRuleKey;
            firedAlerts[i] = {
              alertRuleKey: resultAlertReceivedPc[i].alertRuleKey,
              alertReceivedKey: resultAlertReceivedPc[i].alertReceivedKey,
              alertReceivedId: resultAlertReceivedPc[i].alertReceivedId,
              alertReceivedName: resultAlertReceivedPc[i].alertReceivedName,
              alertReceivedNode: resultAlertReceivedPc[i].alertReceivedNode || '',
              alertReceivedService: resultAlertReceivedPc[i].alertReceivedService || '',
              alertReceivedPod: resultAlertReceivedPc[i].alertReceivedPod || '',
              alertReceivedPersistentvolume: resultAlertReceivedPc[i].alertReceivedPersistentvolumeclaim,
            };
            const resultAlertRule = await this.alertRule.findOne({ where: { alertRuleKey } });
            const alertName = resultAlertReceivedPc[i].alertReceivedName;
            let severity = resultAlertRule.alertRuleSeverity;
            severity = severity.replace(/^./, severity[0].toUpperCase());
            const duration = resultAlertRule.alertRuleDuration;
            const alertName2 = alertName + severity + '_' + duration;
            inputAlerts[alertName2] = 1;
          }
        }
        break;
    }

    returnResponse = { ...revBayesianModel2, firedAlerts, inputAlerts, anomalyMonitoringTargetId };

    const step5 = new Date().getTime();
    const elaps5 = (step5 - step4) / 1000;
    console.log('#METRICOPS step5 -', elaps5 + ' ' + resourceName);

    // 4. Save the request map to the db
    //use uuid instead of tableid due to performance reason
    //const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('Evaluation');
    //const evaluationId: string = responseTableIdData.tableIdFinalIssued;
    //console.log (evaluationId);
    const uuid = require('uuid');
    const evaluationId = uuid.v1();

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
    console.log('#METRICOPS step6 -', elaps6 + ' ' + resourceName);
    console.log('#METRICOPS step6 - evaluationResultStatus', evaluationResultStatus);
    if (evaluationResultStatus === 'NF' || evaluationResultStatus === 'NR') {
      returnResponse = {
        ...returnResponse,
        evaluationId: evaluationId,
        evaluationResultStatus: evaluationResultStatus,
        evaluationResult: 'No fired alerts',
        resourceName: resourceName,
        resourceId: resourceId,
        bayesianModel: revBayesianModel2,
      };
      console.log('#MetrcOps total elaps: ', elaps1 + elaps2 + elaps3 + elaps4 + elaps5 + elaps6 + ' ' + resourceName);
      return returnResponse;
    }

    // 5. Call NexClipper BN
    bnData = {
      evaluationId: evaluationId,
      bayesianModelId: bayesianModelIdForBn,
      inputAlerts: inputAlerts,
    };
    console.log('#METRICOPS step6 - bnData', JSON.stringify(bnData));

    const url = config.ncBnApiDetail.ncBnUrl + config.ncBnApiDetail.ncBnPredictPath;
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
        console.log('#METRICOPS 6-1 Success', res.data + ' ' + resourceName);
        //console.log(`got evaluation result -- ${evaluationResult}`);
      })
      .catch(error => {
        //console.log(error);
        const updateError = {
          evaluationStatus: 'FL',
          evaluaionResultStatus: 'FL',
          evaluated_at: new Date(),
          updated_at: new Date(),
          updated_by: 'SYSTEM',
        };
        const updateErrorWhere = {
          where: { evaluationId: evaluationId },
        };
        console.log('#METRICOPS 6-2', error + ' ' + resourceName);
        console.log('#METRICOPS 6-2 url', url);
        const resultEvaluationResult = this.evaluation.update(updateError, updateErrorWhere);
        throw new HttpException(500, `Unknown error to fetch the result of evaluation from nexclipper-bn: ${evaluationId}`);
      });

    const step7 = new Date().getTime();
    const elaps7 = (step7 - step6) / 1000;
    console.log('#METRICOPS step7 -', elaps7 + ' ' + resourceName);

    const predictedScore = evaluationResult.predicted_score;
    console.log('#METRICOPS step7-1 evaluation result: ', evaluationResult + ' ' + resourceName);
    const nodeThreshold = Number(config.ncBnApiDetail.ncBnNodeThreshold);
    const podThreshold = Number(config.ncBnApiDetail.ncBnPodThreshold);
    const pvcThreshold = Number(config.ncBnApiDetail.ncBnPvcThreshold);

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
    } else if (resourceType === 'PC') {
      if (predictedScore >= pvcThreshold) {
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
      ...returnResponse,
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
    console.log('#METRICOPS step8 -', elaps8 + ' ' + resourceName);
    console.log('#METRICOPS total elaps: ', elaps1 + elaps2 + elaps3 + elaps4 + elaps5 + elaps6 + elaps7 + elaps8 + ' ' + resourceName);
    // end for resourceLev 4 - Node, Svc, Pvc
    return returnResponse;
  }

  /**
   * Process anomaly from model-BN
   *
   * @param  {resultEvaluationDto} resultEvaluationDto
   * @param  {number} anomalyMonitoringTargetKey
   * @param  {string} resourceid
   * @returns Promise<any>
   * @author Jerry Lee
   */
  public async processAnomaly(resultData: resultEvaluationDto, anomalyMonitoringTargetKey: number): Promise<any> {
    // if incident ticket issued x min before, don't create a new incident ticket
    const currentDate = new Date();
    const currentDate2 = new Date();
    const fromDate = new Date(currentDate.setMinutes(currentDate.getMinutes() - 5));
    const toDate = new Date();
    let resultEvaluation;
    const evaluationRequest = resultData.evaluationRequest;
    const evaluationResult = resultData.evaluationResult;
    const evaluationId = resultData.evaluationId;
    const targetResourceId = resultData.resourceId;
    console.log('MOEVAL-STEP4 - targetResourceId', targetResourceId);

    const findAnomalyMonitoringTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.findOne({
      where: { deletedAt: null, anomalyMonitoringTargetKey },
    });
    const anomalyMonitoringTargetId = findAnomalyMonitoringTarget.anomalyMonitoringTargetId;
    const customerAccountKey = findAnomalyMonitoringTarget.customerAccountKey;
    const findSystemUser: IPartyUser = await this.partyUser.findOne({ where: { userId: config.initialRecord.partyUser.userId } });
    const partyUserId = findSystemUser.partyUserId;

    // don't execut resolution action if the action was executed within 10min
    const findEvaluation: IEvaluation[] = await this.evaluation.findAll({
      where: { anomalyMonitoringTargetKey, evaluationResultStatus: 'AN', createdAt: { [Op.and]: { [Op.gte]: fromDate, [Op.lte]: toDate } } },
    });

    console.log('MOEVAL-STEP4 - findEvaluation', findEvaluation.length);

    if (findEvaluation.length <= 1) {
      //4.1. bring resource namespace, if pod, bring prometheus address from resourceGroup
      const getResource = await this.resource.findOne({
        where: { resourceId: targetResourceId },
        attributes: ['resourceNamespace', 'resourcePvcStorage', 'resourceName', 'resourceType', 'resourceGroupKey'],
        include: [
          {
            model: ResourceGroupModel,
            as: 'ResourceGroup',
            attributes: ['resourceGroupPrometheus', 'resourceGroupUuid'],
          },
        ],
      });
      const resourceNamespace = getResource.resourceNamespace;
      console.log('MOEVAL-STEP4 - Resource Name', getResource.resourceName);

      let podName;
      let nodeName;
      let pvcName;
      if (getResource.resourceType === 'PC') {
        pvcName = getResource.resourceName;
        const queryRs = `SELECT * FROM Resource WHERE deleted_at is null AND resource_type = 'PD' AND resource_group_key = ${getResource.resourceGroupKey} AND JSON_VALUE(resource_spec, '$.volumes[0].persistentVolumeClaim.claimName') = '${pvcName}'`;
        const findRs = await DB.sequelize.query(queryRs, { type: QueryTypes.SELECT });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        podName = findRs[0].resource_name;
        console.log('MOEVAL-STEP4 - PVC name', pvcName);
        console.log('MOEVAL-STEP4 - Pod name for PVC', podName);
      }
      if (getResource.resourceType === 'PD') podName = getResource.resourceName;
      if (getResource.resourceType === 'ND') nodeName = getResource.resourceName;

      let volume = '';
      let volumeVal = 0;
      let volumeVal10 = 0;
      let volumeVal10String = '';
      let volumeVal20 = 0;
      let volumeVal20String = '';
      let volumeVal30 = 0;
      let volumeVal30String = '';
      if (getResource.resourcePvcStorage) {
        console.log('MOEVAL-STEP4 - PVC:', JSON.stringify(getResource.resourcePvcStorage));
        volume = getResource.resourcePvcStorage?.requests.storage;
        console.log('MOEVAL-STEP4 - Volume:', volume);
        if (volume.indexOf('Gi') > 0) {
          volumeVal = parseFloat(volume.replace('Gi', ''));
          volumeVal10 = Math.round(volumeVal * 1.1);
          volumeVal10String = volumeVal10.toString() + 'Gi';
          volumeVal20 = Math.round(volumeVal * 1.2);
          volumeVal20String = volumeVal20.toString() + 'Gi';
          volumeVal30 = Math.round(volumeVal * 1.3);
          volumeVal30String = volumeVal30.toString() + 'Gi';
          console.log('MOEVAL-STEP4 - Volume.indexOf Gi:', volume.indexOf('Gi'));
        } else if (volume.indexOf('Mi') > 0) {
          volumeVal = parseFloat(volume.replace('Mi', ''));
          volumeVal10 = Math.round(volumeVal * 1.1);
          volumeVal10String = volumeVal10.toString() + 'Mi';
          volumeVal20 = Math.round(volumeVal * 1.2);
          volumeVal20String = volumeVal20.toString() + 'Mi';
          volumeVal30 = Math.round(volumeVal * 1.3);
          volumeVal30String = volumeVal30.toString() + 'Mi';
          console.log('MOEVAL-STEP4 - Volume.indexOf Mi:', volume.indexOf('Mi'));
        } else {
          volumeVal = parseFloat(volume);
          volumeVal10 = Math.round(volumeVal * 1.1);
          volumeVal10String = volumeVal10.toString();
          volumeVal20 = Math.round(volumeVal * 1.2);
          volumeVal20String = volumeVal20.toString();
          volumeVal30 = Math.round(volumeVal * 1.3);
          volumeVal30String = volumeVal30.toString();
          console.log('MOEVAL-STEP4 - else case');
        }
        console.log('MOEVAL-STEP4 - volumeVal30String', volumeVal30String);
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const prometheusUrl = getResource.dataValues.ResourceGroup.dataValues.resourceGroupPrometheus;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const clusterUuid = getResource.dataValues.ResourceGroup.dataValues.resourceGroupUuid;
      //4.2. if any anomaly, create incident ticket
      const incidentData = {
        incidentName: `MetricOps:${getResource.resourceType}:${getResource.resourceName}-${evaluationId}`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        incidentDescription: `MetricOps: evaluation Id ${JSON.stringify(evaluationResult.evaluation_id)}`,
        incidentStatus: 'OP' as incidentStatus,
        incidentSeverity: 'UR' as incidentSeverity,
        incidentDueDate: null,
        assigneeId: '',
        evaluationId,
      };

      const resultIncidentCreate: IIncident = await this.incidentService.createIncident(customerAccountKey, partyUserId, incidentData);
      const incidentId = resultIncidentCreate.incidentId;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const firedAlerts = evaluationRequest.firedAlerts;
      const firedAlertList = firedAlerts.map(a => a.alertReceivedId);
      const alertReceivedIds = { alertReceivedIds: firedAlertList };

      console.log('MOEVAL-STEP5');
      //5. attach the alerts (from the result) to the incident tickets
      await this.incidentService.addAlertReceivedtoIncident(customerAccountKey, incidentId, alertReceivedIds, partyUserId);
      console.log(`incident ticket is created: ', ${incidentId}, 'Alert Attached - ', ${alertReceivedIds}`);

      console.log('MOEVAL-STEP6');
      //6. execute any resolution actions if there are actions under rule group more than a threshold
      const nodeThreshold = Number(config.ncBnApiDetail.ncBnNodeThreshold);
      const podThreshold = Number(config.ncBnApiDetail.ncBnPodThreshold);
      const pvcThreshold = Number(config.ncBnApiDetail.ncBnPvcThreshold);

      const ruleGroup = [];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Object.entries(resultData.evaluationResult?.alert_group_score).filter(([key, value]) => {
        const ruleValue = Number(value);
        if (resultData.resourceType == 'ND') {
          if (ruleValue >= nodeThreshold) {
            ruleGroup.push(key);
          }
        } else if (resultData.resourceType == 'PD') {
          if (ruleValue >= podThreshold) {
            ruleGroup.push(key);
          }
        } else if (resultData.resourceType == 'PC') {
          if (ruleValue >= pvcThreshold) {
            ruleGroup.push(key);
          }
        }
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (let i = 0; i < resultData.evaluationRequest?.ruleGroup.length; i++) {
        console.log('MOEVAL-STEP7');
        const resolutionActions = await this.resolutionActionService.getResolutionActionByRuleGroupId(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          resultData.evaluationRequest?.ruleGroup[i].ruleGroupId,
        );
        console.log('MOEVAL-STEP8 - resolutionAction list', JSON.parse(JSON.stringify(resolutionActions)));
        resolutionActions.length &&
          resolutionActions.map(async (resolutionAction: any) => {
            //7. postExecuteService to sudory server
            const start = new Date(currentDate.setHours(currentDate.getHours() - 12)).toISOString().substring(0.19);
            const end = currentDate2.toISOString().substring(0.19);
            const subscribed_channel = config.sudoryApiDetail.channel_webhook;
            const templateUuid = resolutionAction.sudoryTemplate.sudoryTemplateUuid;
            let steps = JSON.stringify(resolutionAction.resolutionActionTemplateSteps);
            steps = steps.replace('#namespace', resourceNamespace);
            steps = steps.replace('#prometheusurl', prometheusUrl);
            steps = steps.replace('#resourcename', resultData.resourceName);
            steps = steps.replace('#name', resultData.resourceName);
            steps = steps.replace('#pvcname', pvcName);
            steps = steps.replace('#podname', podName);
            steps = steps.replace('#nodename', nodeName);
            steps = steps.replace('#start', start);
            steps = steps.replace('#end', end);
            steps = steps.replace('#expandedvolume30%', volumeVal30String);
            steps = steps.replace('#expandedvolume20%', volumeVal20String);
            steps = steps.replace('#expandedvolume10%', volumeVal10String);
            steps = JSON.parse(steps);
            const stepsEnd = [{ args: steps }];
            console.log('MOEVAL-STEP8 - ResolutionAction', JSON.stringify(stepsEnd));
            const serviceOutput: any = await this.executorService.postExecuteService(
              `METRICOPS-${resolutionAction?.resolutionActionName}/:CUST-${customerAccountKey}/:INC-${incidentId}`,
              `INC-${incidentId}`,
              clusterUuid,
              templateUuid,
              stepsEnd,
              customerAccountKey,
              subscribed_channel,
            );
            const sleep = ms => new Promise(r => setTimeout(r, ms));
            await sleep(5000);
            console.log('MOEVAL-STEP9 - resolution action request output', serviceOutput);
          });
      }
      resultEvaluation = {
        anomalyMonitoringTargetId: anomalyMonitoringTargetId,
        evaluationId: resultData.evaluationId,
        evaluationResultStatus: resultData.evaluationResultStatus,
        evaluationResult: resultData.evaluationResult,
        resourceId: resultData.resourceId,
        resourceName: resultData.resourceName,
        incidentId,
        ruleGroup,
      };
    } else {
      resultEvaluation = {
        anomalyMonitoringTargetId: anomalyMonitoringTargetId,
        evaluationId: resultData.evaluationId,
        evaluationResultStatus: resultData.evaluationResultStatus,
        resourceId: resultData.resourceId,
        resourceName: resultData.resourceName,
        incidentId: '',
        evaluationResult: resultData.evaluationResult,
        ruleGroup: '',
      };
    } // end of if
    //8. save the communicaiton result to notification table

    //9. create a message for return

    return resultEvaluation;
  }

  /**
   * Trigger evaluation process by customerAccountId
   *
   * @param  {string} customerAccountId
   * @returns Promise<object>
   * @author Jerry Lee
   */

  public async initiateEvaluationProcess(customerAccountId: string, userId: string): Promise<any> {
    console.log('MOEVAL-STEP1');
    //1. validate customerAccountid
    const resultCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountId, deletedAt: null } });
    if (!resultCustomerAccount) throw new HttpException(400, `Can't find customerAccount - ${customerAccountId}`);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    console.log('MOEVAL-STEP2');
    //2. pull monitoring targets
    const resultMonitoringTarget: IAnomalyMonitoringTarget[] = await this.monitoringTargetService.findMonitoringTargetsByCustomerAccountKey(
      customerAccountKey,
    );
    if (!resultMonitoringTarget) throw new HttpException(401, `Can't find AnomalyTarget - ${customerAccountId}`);

    console.log('MOEVAL-STEP3');
    //3. call evaluateMonitorintTarget (ML)
    const resultReturn = {};
    console.log('MOEVAL-STEP3 -resultMonitoringTarget.length', resultMonitoringTarget.length);
    for (let i = 0; i < resultMonitoringTarget.length; i++) {
      let resultEvaluation;

      //const resourceKey = resultMonitoringTarget[i].resourceKey;
      const anomalyMonitoringTargetId = resultMonitoringTarget[i].anomalyMonitoringTargetId;
      const anomalyMonitoringTargetKey = resultMonitoringTarget[i].anomalyMonitoringTargetKey;
      //const anomalyMonitoringTargetKey = resultMonitoringTarget[i].anomalyMonitoringTargetKey;
      const resourceKey = resultMonitoringTarget[i].resourceKey;
      const findResource: IResource = await this.resource.findOne({ where: { deletedAt: null, resourceKey } });
      const preResourceId = findResource.resourceId;
      console.log('MOEVAL-STEP3 -findResource', findResource);
      if (findResource) {
        if (findResource.resourceLevel4 === 'WL') {
          const preResourceGroupKey = findResource.resourceGroupKey;
          const preResourceName = findResource.resourceName;
          //get pods if the target is a workload and request the evaluation using anomaly id and resource id
          const queryPd = `SELECT * FROM Resource WHERE deleted_at is null AND resource_type = 'PD' AND resource_name like '${preResourceName}%' AND resource_group_key = ${preResourceGroupKey}`;
          console.log('queryPd', queryPd);
          const findPods: ResourceRawDto[] = await DB.sequelize.query(queryPd, { type: QueryTypes.SELECT });
          //console.log('findPods', findPods);
          if (findPods.length <= 0) {
            //if there is no pod under workload
            resultEvaluation = {
              anomalyMonitoringTargetId,
              evaluationId: '',
              evaluationResultStatus: 'IN',
              resourceId: '',
              resourceName: '',
              incidentId: '',
              evaluationResult: '',
            };
          } else {
            //loop to process pod's evaluation of Workload
            console.log('MOEVAL-STEP3 -findPods', findPods.length);
            for (let a = 0; a < findPods.length; a++) {
              console.log('MOEVAL-STEP3 - start-------');
              const responseEvaluation: resultEvaluationDto = await this.evaluateMonitoringTarget(anomalyMonitoringTargetId, findPods[a].resource_id);
              const { evaluationResult, evaluationResultStatus, evaluationId, resourceId, resourceName, bayesianModel } = responseEvaluation;
              console.log(`evaluationResultStatus------${evaluationResultStatus}`);
              if (evaluationResultStatus === 'AN') {
                console.log('MOEVAL-STEP4 - ANOMALY');
                resultEvaluation = await this.processAnomaly(responseEvaluation, anomalyMonitoringTargetKey);
                console.log('done');
              } else {
                //evaluationResultStatus - 'NF' or 'OK'
                console.log('MOEVAL-STEP4 - WL Pod Processing');
                resultEvaluation = {
                  anomalyMonitoringTargetId,
                  evaluationId,
                  evaluationResultStatus,
                  resourceId,
                  resourceName,
                  incidentId: '',
                  evaluationResult,
                  bayesianModel: bayesianModel,
                };
              }
            } //end of for
          }
        } else {
          // for the case of node, pvc, service
          const responseEvaluation: resultEvaluationDto = await this.evaluateMonitoringTarget(anomalyMonitoringTargetId, preResourceId);
          const { evaluationResult, evaluationResultStatus, evaluationId, resourceId, resourceName, bayesianModel } = responseEvaluation;
          console.log(`evaluationResultStatus------${evaluationResultStatus}`);

          if (evaluationResultStatus === 'AN') {
            console.log('MOEVAL-STEP4 - ANOMALY');
            resultEvaluation = await this.processAnomaly(responseEvaluation, anomalyMonitoringTargetKey);
          } else {
            //evaluationResultStatus - 'NF' or 'OK'
            resultEvaluation = {
              anomalyMonitoringTargetId,
              evaluationId,
              evaluationResultStatus,
              resourceId,
              resourceName,
              incidentId: '',
              evaluationResult,
              bayesianModel: bayesianModel,
            };
          }
        }
      } else {
        //if there is no resource under anomalymonitoringtarget
        resultEvaluation = {
          anomalyMonitoringTargetId,
          evaluationId: '',
          evaluationResultStatus: 'IN',
          resourceId: '',
          resourceName: '',
          incidentId: '',
          evaluationResult: '',
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
  public async getEvaluationHistoryAll(customerAccountId: string, limit: number, offset: number): Promise<IEvaluation[]> {
    //1. validate CustomerAccount
    //const resultCustomerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);
    const resultCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountId, deletedAt: null } });
    if (!resultCustomerAccount) throw new HttpException(400, `Can't find customer Account - ${customerAccountId}`);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;
    //2. pull evaluation history
    const queryCondition = {
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
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
        {
          model: IncidentModel,
          required: false,
        },
      ],
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
  public async getEvaluationHistoryByTargetId(anomalyMonitoringTargetId: string, limit: number, offset: number): Promise<IEvaluation[]> {
    //1. validate AnomalyMonitoringTarget
    const resultAnomalyMonitoringTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.findOne({
      where: { anomalyMonitoringTargetId },
    });
    if (!resultAnomalyMonitoringTarget) throw new HttpException(400, `Can't find Anomaly Target - ${anomalyMonitoringTargetId}`);
    const anomalyMonitoringTargetKey = resultAnomalyMonitoringTarget.anomalyMonitoringTargetKey;

    //2. pull evaluation history
    const queryCondition = {
      limit: limit,
      offset: offset,
      where: {
        deletedAt: null,
        anomalyMonitoringTargetKey,
      },
      include: [
        {
          model: IncidentModel,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
