import { IBayesianDBModel } from '@/common/interfaces/bayesianModel.interface';
import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { IResource } from '@/common/interfaces/resource.interface';
import { IIncident } from '@/common/interfaces/incident.interface';
import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import IncidentService from '@/modules/Incident/services/incident.service';
import MonitoringTargetService from '@/modules/MetricOps/services/monitoringTarget.service';
import BayesianModelService from '@/modules/MetricOps/services/bayesianModel.service';
import ModelRuleScoreService from '@/modules/MetricOps/services/modelRuleScore.service';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
import { incidentSeverity, incidentStatus } from '@/common/types/index';
import { IEvaluation } from '@/common/interfaces/evaluate.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
import { BayesianModelTable } from '../models/bayesianModel.model';
import { AnomalyMonitoringTargetTable } from '../models/monitoringTarget.model';
import { logger } from '@/common/utils/logger';

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
  public bayesianModelService = new BayesianModelService();
  public modelRuleScoreService = new ModelRuleScoreService();
  public tableIdService = new TableIdService();
  public incidentService = new IncidentService();

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
    var evaluationResultStatus = '';

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
    switch (resourceType) {
      case 'ND':
        const alertRuleQuery = {
          where: { alertRuleKey: { [Op.in]: alertRuleKey }, deletedAt: null, alertReceivedState: 'firing', alertReceivedNode: resourceName },
        };
        const resultAlertReceived: IAlertReceived[] = await this.alertReceived.findAll(alertRuleQuery);
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

    let url = '';
    let evaluationResult;
    if (resourceType == 'ND') {
      url = config.ncBnApiDetail.ncBnUrl + config.ncBnApiDetail.ncBnNodePath;
    }

    await axios({
      method: 'post',
      url: url,
      data: bnData,
      //              headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
    })
      .then(async (res: any) => {
        const statusCode = res.status;
        if (statusCode != 200) {
          //console.log("result is not ready");
          return res;
        }
        evaluationResult = res.data;
        //console.log(`got evaluation result -- ${evaluationResult}`);
      })
      .catch(error => {
        console.log(error);

        const updateError = {
          evaluationStatus: 'FA',
          evaluated_at: new Date(),
          updated_at: new Date(),
          updated_by: 'SYSTEM',
        };
        const updateErrorWhere = {
          where: { evaluationId: evaluationId },
        };
        const resultEvaluationResult = this.evaluation.update(updateError, updateErrorWhere);
        throw new HttpException(500, `Unknown error to fetch the result of evaluation: ${evaluationId}`);
      });

    const step7 = new Date().getTime();
    const elaps7 = (step7 - step6) / 1000;
    console.log('step7 -', elaps7);

    const predictedScore = evaluationResult.predicted_score;
    var evaluationResultStatus = '';
    if (predictedScore >= config.ncBnApiDetail.ncBnNodeThreshold) {
      evaluationResultStatus = 'AN';
    } else {
      evaluationResultStatus = 'OK';
    }

    const updateData = {
      evaluationResult: evaluationResult,
      //hardcoded for testing. need to read evalatuon result once Shawn's API is ready
      evaluationResultStatus: evaluationResultStatus,
      evaluationStaus: 'SC',
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
  public async initiateEvaluationProcess(customerAccountId: string): Promise<any> {
    //1. validate customerAccountid
    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);
    if (!resultCustomerAccount) throw new HttpException(400, `Can't find customerAccount - ${customerAccountId}`);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    //2. pull monitoring targets
    const resultMonitoringTarget: IAnomalyMonitoringTarget[] = await this.monitoringTargetService.findMonitoringTargetsByCustomerAccountKey(
      customerAccountKey,
    );
    if (!resultMonitoringTarget) throw new HttpException(401, `Can't find AnomalyTarget - ${customerAccountId}`);

    //3. call evaluateMonitorintTarget (ML)

    const resultReturn = {};
    for (let i = 0; i < resultMonitoringTarget.length; i++) {
      const resourceKey = resultMonitoringTarget[i].resourceKey;
      let resultEvaluation = await this.evaluateMonitoringTarget(resourceKey);
      const evaluationResultStatus = resultEvaluation.evaluationResultStatus;
      if (evaluationResultStatus === 'AN') {
        //4. if any anomaly, create incident ticket
        const incidentData = {
          incidentName: 'MetricOps: ',
          incidentDescription: 'MetricOps ',
          incidentStatus: 'OP' as incidentStatus,
          incidentSeverity: 'UR' as incidentSeverity,
          incidentDueDate: null,
          assigneeId: '',
        };
        const resultIncidentCreate: IIncident = await this.incidentService.createIncident(customerAccountKey, 'SYSTEM', incidentData);
        const incidentId = resultIncidentCreate.incidentId;
        const firedAlerts = resultEvaluation.evaluationRequest.map(x => x.firedAlerts.alertReceivedId);
        console.log(`incident id: ${incidentId}`);
        console.log(`firedAlerts: ${firedAlerts}`);
        //5. attach the alerts (from the result) to the incident tickets
        await this.incidentService.addAlertReceivedtoIncident(customerAccountKey, incidentId, firedAlerts, 'SYSTEM');
        console.log('incident ticket is created: ', incidentId, 'Alert Attached - ', firedAlerts);
        //6. execute any resolution actions if there are actions under rule group more than a threshhold

        //7. save the actions to incident actions

        //8. send email to access group user.

        //9. create a message for return
        resultEvaluation = {
          evaluationId: resultEvaluation.evaluationId,
          evaluationResultStatus: resultEvaluation.evaluationResultStatus,
          evaluationResult: resultEvaluation.evaluationResult,
          resourceId: resultEvaluation.resourceId,
          resourceName: resultEvaluation.resourceName,
          incidentId: incidentId,
        };
      } else {
        resultEvaluation = {
          evaluationId: resultEvaluation.evaluationId,
          evaluationResultStatus: resultEvaluation.evaluationResultStatus,
          resourceId: resultEvaluation.resourceId,
          resourceName: resultEvaluation.resourceName,
          incidentId: '',
          evaluationResult: resultEvaluation.evaluationResult,
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
