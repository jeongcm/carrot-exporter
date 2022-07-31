import { IBayesianDBModel } from '@/common/interfaces/bayesianModel.interface';
import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
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

const { Op } = require('sequelize');

class EvaluateServices {
    public bayesianModel = DB.BayesianModel;
    public ruleGroupAlertRule = DB.RuleGroupAlertRule;
    public ruleGroup = DB.RuleGroup;
    public resource = DB.Resource;
    public alertRule = DB.AlertRule;
    public alertReceived = DB.AlertReceived;
    public evaluation = DB.Evaluation;
    public customerAccountService = new CustomerAccountService();
    public monitoringTargetService = new MonitoringTargetService(); 
    public bayesianModelService = new BayesianModelService(); 
    public modelRuleScoreService = new ModelRuleScoreService(); 
    public tableIdService = new TableIdService();
    public incidentService = new IncidentService();
    public AnomalyMonitoringTarget = DB.AnomalyMonitoringTarget;

    /**
     * Evaluate anomaly using resourceKey
     *
     * @param  {string} resourceKey
     * @returns Promise<object>
     * @author Jerry Lee
     */
    public async evaluateMonitoringTarget(resourceKey: number): Promise<any> {

        var bayesianModel = {};
        var returnResponse = {};
        var bnData = {};

        // 1. Confirm resource as AnomalyTarget
        const resultMonitoringTarget = await this.monitoringTargetService.findMonitoringTargetsByResourceKeys(resourceKey);
        if (!resultMonitoringTarget) throw new HttpException(400, `Can't find anomaly target - ${resourceKey}`)

        const resultResource: IResource = await this.resource.findOne({where: {resourceKey}}); 
        if (!resultResource) throw new HttpException(400, `Can't find resource - ${resourceKey}`)
        const resourceType = resultResource.resourceType;
        const resourceName = resultResource.resourceName;
        const resourceId = resultResource.resourceId;

        // 2. Pull model to find alert rules
        const bayesianModelKey = resultMonitoringTarget.bayesianModelKey;
        const resultBayesianModel: IBayesianDBModel = await this.bayesianModelService.findBayesianModelByKey(bayesianModelKey);  
        const bayesianModelId = resultBayesianModel.bayesianModelId; 

        bayesianModel = {bayesianModleKey:  resultBayesianModel.bayesianModelKey, 
                         bayesianModleId:  bayesianModelId, 
                         bayesianModelName: resultBayesianModel.bayesianModelName
                        }

        const resultModelRuleScore: IModelRuleScore[] = await this.modelRuleScoreService.getModelScoreByBayesianModelKey(bayesianModelKey); 
        const ruleGroupKey = resultModelRuleScore.map(x => x.ruleGroupKey);
        
        const ruleGroupQuery = {
        where: { ruleGroupKey: { [Op.in]: ruleGroupKey },
                 deletedAt: null
        }};

        var ruleGroup = [];
        const resultRuleGroup = await this.ruleGroup.findAll(ruleGroupQuery);
        for (let i=0; i<resultRuleGroup.length; i++){
            ruleGroup[i] = {ruleGroupId: resultRuleGroup[i].ruleGroupId, 
                            ruleGroupKey: resultRuleGroup[i].ruleGroupKey,
                            ruleGroupName: resultRuleGroup[i].ruleGroupName
                           }
        };
        let resourceInfo = {resourceKey: resourceKey,
                            resourceId: resourceId,
                            resourceName: resourceName,
                            resourceType: resourceType,
                            }; 
        let revBayesianModel = {bayesianModel, resourceInfo, ruleGroup}; 

        var ruleGroupAlertRule = [];
        const resultRuleGroupList = await this.ruleGroupAlertRule.findAll(ruleGroupQuery); 
        const alertRuleKey = resultRuleGroupList.map(x => x.alertRuleKey);

        for (let i=0; i<resultRuleGroupList.length; i++){
            ruleGroupAlertRule[i] = {
                            ruleGroupKey: resultRuleGroupList[i].ruleGroupKey,
                            alertRuleKey: resultRuleGroupList[i].alertRuleKey,
                           }; 
        };

        let revBayesianModel2 = { ...revBayesianModel, ruleGroupAlertRule}; 
        
        // 3. Find firing alerts received
        let firedAlerts = [];
        let inputAlerts = {};
        switch (resourceType) {
            case "ND": 
                const alertRuleQuery = {
                    where: { alertRuleKey: { [Op.in]: alertRuleKey },
                                deletedAt: null,
                                alertReceivedState: "firing",
                                alertReceivedNode: resourceName,
                    }};
                const resultAlertReceived: IAlertReceived[] = await this.alertReceived.findAll(alertRuleQuery);    
                if (resultAlertReceived.length===0) {
                    firedAlerts = [];
                    console.log ("no firing alert");   
                }
                else {
                    for(let i=0; i< resultAlertReceived.length; i++){
                        let alertRuleKey = resultAlertReceived[i].alertRuleKey;
                        firedAlerts[i] = {alertRuleKey: resultAlertReceived[i].alertRuleKey,
                                        alertReceivedKey: resultAlertReceived[i].alertReceivedKey,
                                        alertReceivedId: resultAlertReceived[i].alertReceivedId,
                                        alertReceivedName: resultAlertReceived[i].alertReceivedName}; 
                        let resultAlertRule = await this.alertRule.findOne({where: {alertRuleKey}})                 
                        let alertName = resultAlertReceived[i].alertReceivedName ;
                        let severity = resultAlertRule.alertRuleSeverity;
                        severity = severity.replace(/^./, severity[0].toUpperCase()); 
                        let duration = resultAlertRule.alertRuleDuration;
                        let alertName2 = alertName + severity + "_" + duration;
                        //let alertName2 = alertName;

                        //inputAlerts[i] = {[alertName2]: 1}
                        inputAlerts[alertName2] = 1;
                    }
                }
            break;
            case "SV":
                firedAlerts = []; 
            break;
        }
        
        returnResponse = {...revBayesianModel2,firedAlerts, inputAlerts};
        console.log (returnResponse);  

        // 4. Save the request map to the db
        const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('Evaluation');
        const evaluationId: string = responseTableIdData.tableIdFinalIssued;
        let createEvaluation = {
            evaluationId: evaluationId,
            createdAt: new Date(),
            createdBy: "SYSTEM",
            requestedAt: new Date(),
            evaluationRequest: returnResponse
        }
        const resultEvaluationRequest = await this.evaluation.create(createEvaluation);

        console.log (inputAlerts);


        // 5. Call NexClipper BN
        bnData = {
            evaluationId: evaluationId,
            bayesianModelId: bayesianModelId,
            inputAlerts: inputAlerts,
        }
        console.log (bnData); 

        var url = "";
        var evaluationResult;
        if (resourceType == 'ND'){
            url = config.ncBnApiDetail.ncBnUrl + config.ncBnApiDetail.ncBnNodePath;
        }

        await axios(
            {
              method: 'post',
              url: url,
//              headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
            }).then(async (res: any) => {
              const statusCode = res.data.status;
              if (statusCode !=4) {
                  console.log("result is not ready");
                  return;
              }    
              evaluationResult = JSON.parse(res.data);
              console.log(`got evaluation result -- ${evaluationResult}`);
      
            }).catch(error => {
              console.log(error);
              
              const updateError = {
                evaluationStatus: "FA",
                evaluated_at: new Date(),
                updated_at: new Date(),
                updated_by: "SYSTEM"
                }
              const updateErrorWhere = {
                    where: { evaluationId: evaluationId },
                }
              const resultEvaluationResult = this.evaluation.update(updateError, updateErrorWhere);
            
              throw new HttpException(500, `Unknown error to fetch the result of evaluation: ${evaluationId}`);
            });

        const updateData = {
            evaluationResult: evaluationResult,
            //hardcoded for testing. need to read evalatuon result once Shawn's API is ready
            evaluationResultStatus: "AN",
            evaluationStaus: "SC",
            evaluated_at: new Date(),
            updated_at: new Date(),
            updated_by: "SYSTEM"
        }
        
        const updateWhere = {
            where: { evaluationId: evaluationId },
        }

        // 6. Save the results to the database
        const resultEvaluationResult =  await this.evaluation.update(updateData, updateWhere);   

        // 7. Return the evaluation result back to caller
    
        return resultEvaluationResult;
    };

    public async initiateEvaluationProcess(customerAccountId: string): Promise<any>{

        //1. validate customerAccountid
        const resultCustomerAccount  = await this.customerAccountService.getCustomerAccountById(customerAccountId);
        if (!resultCustomerAccount) throw new HttpException(400, `Can't find customerAccount - ${customerAccountId}`)
        const customerAccountKey = resultCustomerAccount.customerAccountKey

        //2. pull monitoring targets
        const resultMonitoringTarget: IAnomalyMonitoringTarget[] = await this.monitoringTargetService.findMonitoringTargetsByCustomerAccountKey(customerAccountKey);
        if (!resultMonitoringTarget) throw new HttpException(401, `Can't find AnomalyTarget - ${customerAccountId}`)

        //3. call evaluateMonitorintTarget

        for (let i=0; i<resultMonitoringTarget.length; i++)
        {
            let resourceKey = resultMonitoringTarget[i].resourceKey;
            let resultEvaluation = await this.evaluateMonitoringTarget(resourceKey);
            let evaluationResultStatus = resultEvaluation.evaluationResultStatus; 
            if (evaluationResultStatus==="AN")
                {
        //4. if any anomaly, create incident ticket
                    let incidentData = {
                        incidentName: "MetricOps: ",
                        incidentDescription: "",
                        incidentStatus: "OP",
                        incidentSeverity: "UR",
                    };
                    //const resultIncidentCreate: IIncident = await this.incidentService.createIncident(customerAccountKey,"SYSTEM" ,incidentData);                         

        //5. attach the alerts (from the result) to the incident tickets
    
        //6. execute any resolution actions if there are actions under rule group more than a threshhold

        //7. save the actions to incident actions
                }
        }    
     return;   
    }

}

export default EvaluateServices;
