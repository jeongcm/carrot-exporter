import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ResourceGroupExecutorDto } from '@/modules/Resources/dtos/resourceGroup.dto';
import { IExecutorClient, ExecutorResultDto, ExecutorResourceListDto, IExecutorClientCheck, SudoryWebhookDto } from '@/modules/CommonService/dtos/executor.dto';

//import TableIdService from '@/modules/CommonService/services/tableId.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
//import { isBreakOrContinueStatement } from 'typescript';
//import { template } from 'lodash';
import MetricMetaService from '@/modules/Metric/services/metricMeta.service';
import SchedulerService from '@/modules/Scheduler/services/scheduler.service';
import { IExecutorService } from '@/common/interfaces/executor.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

class executorService {
//    public tableIdService = new TableIdService();
    public customerAccountService = new CustomerAccountService();
    public resourceGroupService = new ResourceGroupService();
    public MetricMetaService = new MetricMetaService();
    public schedulerService = new SchedulerService();
    public sudoryWebhook = DB.SudoryWebhook; 
    public executorService = DB.ExecutorService; 
    public resourceGroup = DB.ResourceGroup;
    public exporters = DB.Exporters;

  /**
   * @param {string} serviceUuid
   */
   public async checkExecutorResourceResponse(serviceUuid: string ): Promise<ExecutorResultDto> {

    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService + "/" + serviceUuid + "/result" ; 
    var serviceUuid="";
    var clusterUuid="";
    var name="";
    var result=[];
    var status="Not_Ready";

    await axios(
      {
        method: 'get',
        url: `${executorServerUrl}`,
        headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
      }).then(async (res: any) => {
        const statusCode = res.data.status;
        if (statusCode !=4) {
            console.log("result is not ready");
            return;
        }    
        serviceUuid = res.data.uuid; 
        clusterUuid = res.data.cluster_uuid;
        name = res.data.name;
        status = "Ready";
        console.log(`patched the result of serviceUuid: ${serviceUuid}`);

        const resourceDetails =  JSON.parse(res.data.result);
        const itemsLength = (resourceDetails.items).length; 
        
        for (let i=0; i < itemsLength; i++)
            {
                let resourceName = resourceDetails.items[i];
                result.push({name: resourceName.metadata.name, 
                             resource_uuid: resourceName.metadata.uid, 
                             creation: resourceName.metadata.creationTimestamp
                            });
            }

      }).catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of serviceUuid: ${serviceUuid}`);
      });
    
    const executorResult = {serviceUuid: serviceUuid, clusterUuid: clusterUuid, name: name, result: result, status: status} 
    return executorResult;
   }

  /**
   * @param {string} serviceUuid
   */
   public async checkExecutorResponse(serviceUuid: string ): Promise<ExecutorResultDto> {

    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService + "/" + serviceUuid + "/result" ; 
    var serviceUuid="";
    var clusterUuid="";
    var name="";
    var result=[];
    var status="Not_Ready";

    await axios(
      {
        method: 'get',
        url: `${executorServerUrl}`,
        headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
      }).then(async (res: any) => {
        const statusCode = res.data.status;
        if (statusCode !=4) {
            console.log("result is not ready");
            return;
        }    
        serviceUuid = res.data.uuid; 
        clusterUuid = res.data.cluster_uuid;
        name = res.data.name;
        result = JSON.parse(res.data.result);
        status = "Ready";
        console.log(`patched the result of serviceUuid -- ${serviceUuid}`);

      }).catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of serviceUuid: ${serviceUuid}`);
      });
    
    const executorResult = {serviceUuid: serviceUuid, clusterUuid: clusterUuid, name: name, result: result, status: status} 
    return executorResult;
   }

  /**
   * @param  {ResourceGroupExecutorDto} ResourceGroupExecutorData
   * @param  {string} currentUserId
   */
   public async registerExecutorClient(requestExecutorClient: ResourceGroupExecutorDto, currentUserId: string): Promise<IExecutorClient> {

    var clusterUuid = "";
    var token = "";

    const executorServerClusterUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathCreateCluster;
    const executorServerTokenUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathCreateToken;
    const executorServerBaseUrl = config.sudoryApiDetail.baseURL;
    const customerAccountId = requestExecutorClient.customerAccountId;
    const resourceGroupName = requestExecutorClient.resourceGroupName;
    const resourceGroupProvider = requestExecutorClient.resourceGroupProvider;
    const resourceGroupPlatform = requestExecutorClient.resourceGroupPlatform;

    const customerAccountData = await this.customerAccountService.getCustomerAccountById(customerAccountId);
    if (!customerAccountData) {
      throw new HttpException(404, `customerAccountId ${customerAccountId} not found`);
     }

    const customerAccountName = customerAccountData.customerAccountName;
    const customerAccountKey = customerAccountData.customerAccountKey;
    
    const apiDataName = resourceGroupName;
    const apiDataSummary = `${resourceGroupName} for ${customerAccountName}`; 
    const apiDataOption = {addtionalProp1: {}}; 

    const sudoryCreateCluster = {name: apiDataName, summary: apiDataSummary, polling_option: apiDataOption, polling_limit: 0 }; 
    let sudoryCreateClusterResponse;

    await axios(
      {
        method: 'post',
        url: `${executorServerClusterUrl}`,
        data: sudoryCreateCluster,
        headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
      }).then(async (res: any) => {
        console.log("success to create sudory cluster"); 
        sudoryCreateClusterResponse = res.data;
      }).catch(error => {
        console.log(error);
        return error;
      });
    clusterUuid = sudoryCreateClusterResponse.uuid;

    let sudoryCreateTokenResponse;
    const sudoryCreateTokenData = {name: apiDataName, cluster_uuid: clusterUuid, summary:apiDataSummary  }; 

    await axios(
      {
        method: 'post',
        url: `${executorServerTokenUrl}`,
        data: sudoryCreateTokenData,
        headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
      }).then(async (res: any) => {
        console.log("success to create cluster token"); 
        sudoryCreateTokenResponse = res.data;
      }).catch(error => {
        console.log(error);
        return error;
      });

    token = sudoryCreateTokenResponse.token;
    
    const executorClient:IExecutorClient = 
      {"clusterUuid": clusterUuid, "token": token, "exectuorServerUrl":executorServerBaseUrl }; 

    const resourceGroup =
      { resourceGroupName: resourceGroupName,
        resourceGroupDescription: resourceGroupName,
        resourceGroupProvider: resourceGroupProvider,
        resourceGroupPlatform: resourceGroupPlatform,
        resourceGroupUuid: clusterUuid,
        resourceGroupPrometheus: ""
      }; 

    try {  
      const ResponseResoureGroup: Object = await this.resourceGroupService.createResourceGroup(resourceGroup, currentUserId, customerAccountKey); 
      console.log ("Success to create ResponseGroup: ", ResponseResoureGroup)
    } catch (error) {
      console.log (error);
      throw new HttpException(500, `Error on creating cluster ${resourceGroupName}`);
    }

    try {
    //await scheduleResource(clusterUuid); 
    } catch (error) {
      console.log (error);
      throw new HttpException(500, `Registered a cluster but error on scheduling resource interfaces ${resourceGroupName}`);
    }    
    return executorClient;
  }

  /**
   * @param  {string} clusterUuid
   */
   public async checkExecutorClient(clusterUuid: string, customerAccountKey: number): Promise<IExecutorClientCheck> {
        var clientUuid = "";
        var resourceJobKey = [];
        var executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession;
        const resourceCron = config.resourceCron; 
        const sessionQueryParameter = `?q=(eq%20cluster_uuid%20"${clusterUuid}")`; 
        executorServerUrl = executorServerUrl + sessionQueryParameter;
        const subscribedChannelResource = config.sudoryApiDetail.channel_resource; 
        await axios(
        {
            method: 'get',
            url: `${executorServerUrl}`,
            headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
        }).then(async (res: any) => {
            if(!res.data[0]) {  
            console.log(`Executor/Sudory client not found yet from cluster: ${clusterUuid}`); 
            throw new HttpException(400, `Executor/Sudory client not found yet from cluster: ${clusterUuid}`);
            //return clientUuid;
            };
            const clientData = Object.assign({},res.data[0]); 
            clientUuid = clientData.uuid;
            console.log(`Successful to run API to search Executor/Sudory client ${clientUuid}`);
        }).catch(error => {
            console.log(error);
            throw new HttpException(500, "Unknown error while searching executor/sudory client");
        });

        const newCrontab1 = resourceCron;
        const newCrontab2 = resourceCron;
        const newCrontab3 = resourceCron;
        const newCrontab4 = resourceCron;
        const newCrontab5 = resourceCron;
        const newCrontab6 = resourceCron;
        const newCrontab7 = resourceCron;
        const newCrontab8 = resourceCron;
        const newCrontab9 = resourceCron;
        const newCrontab10 = resourceCron;
        const newCrontab11 = resourceCron;
        const newCrontab12 = resourceCron;
        const newCrontab13 = resourceCron;
        const newCrontab14 = resourceCron;
        const newCrontab15 = resourceCron;  

        const steps = [
            {
                args: {
                        labels: {}
                      }
            }
        ];

    // instant call    
        const resultNd = await this.postExecuteService("K8s interface for Node", "K8s interface for Node", clusterUuid, "00000000000000000000000000000010", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultNd) console.log (resultNd); 
        const resultNS = await this.postExecuteService("K8s interface for Namespace", "K8s interface for Namespace", clusterUuid, "00000000000000000000000000000004", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultNS) console.log (resultNS);
        const resultSV = await this.postExecuteService("K8s interface for Service", "K8s interface for Service", clusterUuid, "00000000000000000000000000000020", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultSV) console.log (resultSV);
        const resultPD = await this.postExecuteService("K8s interface for Pod", "K8s interface for Pod", clusterUuid, "00000000000000000000000000000002", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultPD) console.log (resultPD);
        const resultDP = await this.postExecuteService("K8s interface for Deployment", "K8s interface for Deployment", clusterUuid, "00000000000000000000000000001002", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultDP) console.log (resultDP);
        const resultSS = await this.postExecuteService("K8s interface for StatefulSet", "K8s interface for StatefulSet", clusterUuid, "00000000000000000000000000001004", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultSS) console.log (resultSS);
        const resultDS = await this.postExecuteService("K8s interface for DaemonSet", "K8s interface for DaemonSet", clusterUuid, "00000000000000000000000000001006", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultDS) console.log (resultDS);
        const resultRS = await this.postExecuteService("K8s interface for ReplicaSet", "K8s interface for ReplicaSet", clusterUuid, "00000000000000000000000000001008", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultRS) console.log (resultRS);
        const resultPC = await this.postExecuteService("K8s interface for PVC", "K8s interface for PVC", clusterUuid, "00000000000000000000000000000018", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultPC) console.log (resultPC);
        const resultSE = await this.postExecuteService("K8s interface for Secret", "K8s interface for Secret", clusterUuid, "00000000000000000000000000000014", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultSE) console.log (resultSE);
        const resultEP = await this.postExecuteService("K8s interface for Endpoint", "K8s interface for Endpoint", clusterUuid, "00000000000000000000000000000016", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultEP) console.log (resultEP);
        const resultCM = await this.postExecuteService("K8s interface for Configmap", "K8s interface for Configmap", clusterUuid, "00000000000000000000000000000006", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultCM) console.log (resultCM);
        const resultIG = await this.postExecuteService("K8s interface for Ingress", "K8s interface for Ingress", clusterUuid, "00000000000000000000000000002002", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultIG) console.log (resultIG);
        const resultSC = await this.postExecuteService("K8s interface for Storage Class", "K8s interface for Storage Class", clusterUuid, "00000000000000000000000000003002", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultSC) console.log (resultSC);
        const resultPV = await this.postExecuteService("K8s interface for PV", "K8s interface for PV", clusterUuid, "00000000000000000000000000000012", steps, customerAccountKey, subscribedChannelResource); 
        if (!resultPV) console.log (resultPV);


    // scheduleResource - node
        
        await this.scheduleResource(clusterUuid, customerAccountKey, "ND", newCrontab1
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "ND", cronKey: res});
            console.log(`Submitted resource ND schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource ND schedule request for clsuter:${clusterUuid}`);
        }); //end of catch

    // scheduleResource - namespace
        await this.scheduleResource(clusterUuid, customerAccountKey,  "NS", newCrontab2
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "NS", cronKey: res});           
            console.log(`Submitted resource NS schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource NS schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - service
        await this.scheduleResource(clusterUuid, customerAccountKey,  "SV", newCrontab3
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "SV", cronKey: res});    
            console.log(`Submitted resource SV schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource SV schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Endpoint
        await this.scheduleResource(clusterUuid, customerAccountKey, "EP", newCrontab4
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "EP", cronKey: res});            
            console.log(`Submitted resource EP schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource EP schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - pod
        await this.scheduleResource(clusterUuid, customerAccountKey, "PD", newCrontab5
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "PD", cronKey: res});       
            console.log(`Submitted resource PD schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource PD schedule request for clsuter:${clusterUuid}`);
        }); //end of catch

    // scheduleResource - deployment
        await this.scheduleResource(clusterUuid, customerAccountKey, "DP", newCrontab6
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "DP", cronKey: res});        
            console.log(`Submitted resource DP schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource DP schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - daemonset
        await this.scheduleResource(clusterUuid, customerAccountKey,  "DS", newCrontab7
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "DS", cronKey: res});            
            console.log(`Submitted resource DS schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource DS schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - replicaset
        await this.scheduleResource(clusterUuid, customerAccountKey,  "RS", newCrontab8
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "RS", cronKey: res});            
            console.log(`Submitted resource RS schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource RS schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

        // scheduleResource - statefulset
    //  await this.scheduleResource(clusterUuid, "SS"
    this.scheduleResource(clusterUuid, customerAccountKey, "SS", newCrontab9
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "SS", cronKey: res});            
            console.log(`Submitted resource SS schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource SS schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - pvc
        await this.scheduleResource(clusterUuid, customerAccountKey,  "PC", newCrontab10
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "PC", cronKey: res});            
            console.log(`Submitted resource PC schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource PC schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Secret
        await this.scheduleResource(clusterUuid, customerAccountKey, "SE", newCrontab11
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "SE", cronKey: res});            
            console.log(`Submitted resource SE schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource SE schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Configmap
        await this.scheduleResource(clusterUuid, customerAccountKey, "CM", newCrontab12
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "CM", cronKey: res});            
            console.log(`Submitted resource CM schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource CM schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - PV
        await this.scheduleResource(clusterUuid, customerAccountKey, "PV", newCrontab13
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "PV", cronKey: res});            
            console.log(`Submitted resource PV schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource PV schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Storage Class
        await this.scheduleResource(clusterUuid, customerAccountKey, "SC", newCrontab14
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "SC", cronKey: res});            
            console.log(`Submitted resource SC schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource SC schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Ingress
        await this.scheduleResource(clusterUuid, customerAccountKey, "IG", newCrontab15
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "IG", cronKey: res});            
            console.log(`Submitted resource IG schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource IG schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

        const responseExecutorClientCheck = {resourceJobKey, clientUuid}; 
        return responseExecutorClientCheck;

    }  

  /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace 
   */
    public async installKpsOnResourceGroup(clusterUuid: string, customerAccountKey: number, targetNamespace: string, systemId: string ): Promise<object> {

      var serviceUuid =[];
      //const helmRepoUrl = config.helmRepoUrl;
      const prometheusUrlHead = config.obsUrl.prometheusUrlHead;
      const prometheusUrlTail = config.obsUrl.prometheusUrlTail;
      const grafanaUrlHead = config.obsUrl.grafanaUrlHead;
      const grafanaUrlTail = config.obsUrl.grafanaUrlTail;
      const alertManagerUrlHead = config.obsUrl.alertManagerUrlHead;
      const alertMangerUrlTail = config.obsUrl.alertManagerUrlTail;
      const lokiUrlHead = config.obsUrl.lokiUrlHead;
      const lokiUrlTail = config.obsUrl.lokiUrlTail;

      const prometheus = prometheusUrlHead + targetNamespace + prometheusUrlTail;
      const grafana = grafanaUrlHead + targetNamespace + grafanaUrlTail;
      const alertManager = alertManagerUrlHead + targetNamespace + alertMangerUrlTail;
      const loki = lokiUrlHead + targetNamespace + lokiUrlTail;

      const resultKpsChart = await this.exporters.findAll({where: {exporterType: "HL"}});
      const chartLength = resultKpsChart.length
      var kpsChartName = "";
      var kpsChartVersion = "";
      var kpsChartRepoUrl = "";
      var lokiChartName = "";
      var lokiChartVersion = "";
      var lokiChartRepoUrl = "";
      
      //console.log (resultKpsChart);

      for (let i=0; i<chartLength; i++ ) {
        if (resultKpsChart[i].exporterHelmChartName === "kube-prometheus-stack")
        {
            kpsChartName = resultKpsChart[i].exporterHelmChartName;
            kpsChartVersion = resultKpsChart[i].exporterHelmChartVersion;
            kpsChartRepoUrl = resultKpsChart[i].exporterHelmChartRepoUrl;    
        }
        if (resultKpsChart[i].exporterHelmChartName === "loki-stack")
        {
            lokiChartName = resultKpsChart[i].exporterHelmChartName;
            lokiChartVersion = resultKpsChart[i].exporterHelmChartVersion;
            lokiChartRepoUrl = resultKpsChart[i].exporterHelmChartRepoUrl;
        }
      }

      const kpsSteps=  [{args: 
        {name: 'kps', 
        chart_name: kpsChartName,
        repo_url: kpsChartRepoUrl, 
        namespace: targetNamespace,
        chart_version: kpsChartVersion,
        values:{}
        }
    }]

      const kpsExecuteName = "KPS Helm Instllation";
      const kpsExecuteSummary = "KPS Helm Installation";
      const kpsTemplateUuid =   "20000000000000000000000000000001"  ;                        
      const executeKpsHelm = this.postExecuteService(kpsExecuteName, kpsExecuteSummary, clusterUuid, kpsTemplateUuid, kpsSteps, customerAccountKey, ""); 
      console.log ("########### kps chart installation");
      console.log(executeKpsHelm);

      if (!executeKpsHelm) throw new HttpException(500, `Error on installing kps chart ${clusterUuid}`);

      const lokiSteps=  [{args: 
                            {name: 'loki', 
                            chart_name: lokiChartName,
                            repo_url: lokiChartRepoUrl, 
                            namespace: targetNamespace,
                            chart_version: lokiChartVersion,
                            values:{}
                            }
                        }]

      const lokiExecuteName = "Loki-Promtail Helm Instllation";
      const lokiExecuteSummary = "Loki-Promtail Helm Installation";
      const lokiTemplateUuid =   "20000000000000000000000000000001"  ;                        
      const executeLokiHelm = this.postExecuteService(lokiExecuteName, lokiExecuteSummary, clusterUuid, lokiTemplateUuid, lokiSteps, customerAccountKey, ""); 
      console.log ("########### Loki chart installation");
      console.log(executeLokiHelm);              

      // update ResourceGroup - resourceGroupPrometheus
      const resourceGroup = {
        resourceGroupPrometheus: prometheus,
        resourceGroupGrafana: grafana,
        resourceGroupAlertManager: alertManager,
        resourceGroupLoki: loki
      }; 
      // get system user id

      try {  
        const ResponseResoureGroup: IResourceGroup = await this.resourceGroupService.updateResourceGroupByUuid(clusterUuid, resourceGroup, systemId); 
        console.log ("Success to create ResponseGroup: ", ResponseResoureGroup.resourceGroupId)
        } catch (error) {
        console.log (error);
        throw new HttpException(500, `Error on creating cluster ${clusterUuid}`);
        }     

      //schedule metricMeta  
      await this.scheduleMetricMeta(clusterUuid, customerAccountKey,
      ).then(async (res: any) =>{
        console.log(`Submitted metric meta feeds schedule reqeust on ${clusterUuid} cluster successfully`);
      }).catch(error => {
        console.log(error);
        throw new HttpException(500, "Submitted kps chart installation request but fail to schedule MetricMeta ");
      }); //end of catch
 
      //schedule alert rules & received
      await this.scheduleAlert(clusterUuid, customerAccountKey
        ).then(async (res: any) =>{
          console.log(`Submitted alert feeds schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
          console.log(error);
          throw new HttpException(500, "Submitted kps chart installation request but fail to schedule alert feeds ");
        }); //end of catch

     //schdule SyncMetricReceived    
     await this.scheduleSyncMetricReceived(clusterUuid
        ).then(async (res: any) =>{
            console.log(`Submitted metric-received sync schedule reqeust on ${clusterUuid} cluster successfully`);
          }).catch(error => {
            console.log(error);
            throw new HttpException(500, "Submitted kps chart installation request but fail to schedule metric-received sync");
          }); //end of catch
      return serviceUuid;
    }          

  /**
   * @param {string} clusterUuid
   * @param {string} templateUud
   * @param {string} name
   * @param {string} summary
   * @param {Object} steps
   * @param {string} subscribed_channel
   */
    public async postExecuteService(name: string, summary: string, clusterUuid:string, templateUuid:string, steps:Object, customerAccountKey: number, subscribed_channel: string): Promise<object> {
        
        let on_completion=parseInt(config.sudoryApiDetail.service_result_delete);
        let sudoryBaseUrl = config.sudoryApiDetail.baseURL; 
        let sudoryPathService = config.sudoryApiDetail.pathService;
        let sudoryUrl = sudoryBaseUrl+sudoryPathService; 
        let sudoryChannel = subscribed_channel; 
        let uuid = require('uuid');
        let executorServiceId = uuid.v1();

        let sudoryServiceData = {
          cluster_uuid: clusterUuid,
          name: name,
          template_uuid: templateUuid,
          steps: steps,
          summary: summary,
          on_completion: on_completion,
          subscribed_channel: sudoryChannel,
        };
        console.log(sudoryServiceData); 
        let serviceData = await axios(
          {
            method: 'post',
            url: sudoryUrl,
            data: sudoryServiceData,
          }).then(async (res: any) => {
              //serviceUuid = res.data.uuid
            return res.data
            // console.log(`Submit sudory reqeust on ${clusterUuid} cluster successfully, serviceUuid is ${serviceUuid}`);
  
          }).catch(error => {
            console.log(error);
            throw new HttpException(500, "Not able to execute service");
          });
        
  
          const insertData = {
              executorServiceId: executorServiceId,
              customerAccountKey: customerAccountKey,
              name: name,
              summary: summary,
              createdAt: new Date(),
              createdBy: "SYSTEM",
              serviceUuid: serviceData.uuid,
              clusterUuid: serviceData.cluster_uuid,
              templateUuid: templateUuid,
              onCompletion: on_completion,
              steps: JSON.parse(JSON.stringify(steps)),
              subscribed_channel: sudoryChannel,
          }
          console.log("Data for DB insert: ");
          console.log(insertData);
  
          const resultExecutorService = await this.executorService.create(insertData); 
   
        console.log(resultExecutorService)
        return resultExecutorService;
    }          
  
  /**
   * @param {ExecutorResourceDto} resourceInputData
   */
   public async requestResourceToExecutor(resourceInputData: ExecutorResourceListDto ): Promise<string> {

    var serviceUuid="";
    var template_uuid="";
    var service_name="";
    var service_summary="";
    var argsData;
    
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
  
    const resourceType = resourceInputData.resourceType; 
    const clusterUuid = resourceInputData.clusterUuid;
    const targetNamespace = resourceInputData.targetNamespace;
    const name = resourceInputData.name;
    const labels = resourceInputData.labels;

    //sudory template uuid
    const templateService = "00000000000000000000000000000020";  
    const templateNode = "00000000000000000000000000000010";
    const templateNamespace = "00000000000000000000000000000004"; 
    const templatePod = "00000000000000000000000000000002"
    const templateDeployment = "00000000000000000000000000001002";
    const templateStatefulset = "00000000000000000000000000001004";
    const templateDaemonset = "00000000000000000000000000001006";
    const templateReplicaset = "00000000000000000000000000001008";
    const templatePvc = "00000000000000000000000000000018";
    const templateSecret = "00000000000000000000000000000014"; 
    const templateEndpoint = "00000000000000000000000000000016";
    const templateConfigmap = "00000000000000000000000000000006";
    const templateIngress = "00000000000000000000000000002002";
    const templatePv = "00000000000000000000000000000012"; 
    const templateStorageClass = "00000000000000000000000000003002";
    //const templateJob = "00000000000000000000000000003002";
    //const templateCronJob = "00000000000000000000000000003002";

    switch (resourceType) {
        case "SV":  //service
            service_name = "k8s service list request" 
            service_summary = "k8s service list request" 
            template_uuid = templateService;

            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
             
        break;    

        case "ND":  //node
            service_name = "k8s node list request" 
            service_summary = "k8s node list request" 
            template_uuid = templateNode;
            if(!labels){
                argsData = {labels:{}};
            } else {
                argsData = {labels:labels};
            }

        break;    

        case "NS":  //namespace
            service_name = "k8s namespace list request" 
            service_summary = "k8s namespace list request" 
            template_uuid = templateNamespace;
            if(!labels){
                argsData = {labels:{}};
            } else {
                argsData = {labels:labels};
            }

        break;    
        
        case "PD":  //pod
            service_name = "k8s pod list request" 
            service_summary = "k8s pod list request" 
            template_uuid = templatePod;
            
            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }

        break;    

        case "DP":  //deployment
            service_name = "k8s deployment list request" 
            service_summary = "k8s deployment list request" 
            template_uuid = templateDeployment;
 
            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
 
        break;    

        case "SS":  //statefulset
            service_name = "k8s statefulset list request" 
            service_summary = "k8s statefulset list request" 
            template_uuid = templateStatefulset;

            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
          
        break;    

        case "DS":  //daemonset
            service_name = "k8s daemonset list request" 
            service_summary = "k8s daemonset list request" 
            template_uuid = templateDaemonset;

            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
    
            
        break;    

        case "RS":  //replicaset
            service_name = "k8s replicaset list request" 
            service_summary = "k8s replicaset list request" 
            template_uuid = templateReplicaset;

            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
    
 
        break;    

        case "PC":  //pvc
            service_name = "k8s pvc list request" 
            service_summary = "k8s pvc list request" 
            template_uuid = templatePvc;

            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
    

        break;    

        case "SE":  //secret
            service_name = "k8s secret list request" 
            service_summary = "k8s secret list request" 
            template_uuid = templateSecret;

            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
    
           
        break;    

        case "EP":  //endpoint
            service_name = "k8s endpoint list request" 
            service_summary = "k8s endpoint list request" 
            template_uuid = templateEndpoint;

            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
    

        break;    

        case "CM":  //configmap
            service_name = "k8s configmap list request" 
            service_summary = "k8s configmap list request" 
            template_uuid = templateConfigmap;
            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
    

        break;    

        case "IG":  //ingress
            service_name = "k8s ingress list request" 
            service_summary = "k8s ingress list request" 
            template_uuid = templateIngress;
            if (!targetNamespace){
                if(!labels){
                    argsData = {namespace:"", labels:{}};
                } else {
                    argsData = {namespace:"", labels:labels};
                }
            } else {
                if(!labels){
                    argsData = {namespace:targetNamespace, labels:{}};
                } else {
                    argsData = {namespace:targetNamespace, labels:labels};
                }
            }
    

        break;    

        case "PV":  //pv
            service_name = "k8s pv list request" 
            service_summary = "k8s pv list request" 
            template_uuid = templatePv;
            if(!labels){
                argsData = {labels:{}};
            } else {
                argsData = {labels:labels};
            }

        break;    

        case "SC":  //sc
            service_name = "k8s storage class list request" 
            service_summary = "k8s storage class list request" 
            template_uuid = templateStorageClass;
            if(!labels){
                argsData = {labels:{}};
            } else {
                argsData = {labels:labels};
            }
            
        break;    

        default:
    }
    
    var sudoryServiceData = {cluster_uuid: clusterUuid, 
                               name: service_name,
                               template_uuid: template_uuid, 
                               summary: service_summary, 
                               subscribe_channel: "", 
                               steps: [
                                ] 
                            };
    console.log (argsData);
    argsData = {args: argsData};
    sudoryServiceData.steps.push(argsData);                        
    console.log((sudoryServiceData));      
    await axios(
      {
        method: 'post',
        url: `${executorServerUrl}`,
        data: sudoryServiceData,
        headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
      }).then(async (res: any) => {
        console.log(res);                              
        serviceUuid = res.data.uuid
        console.log(`Submit ${service_name} on ${clusterUuid} cluster successfully, serviceUuid is ${serviceUuid}`);

      }).catch(error => {
        console.log(error);
        throw new HttpException(500, "Unknown error to install kps chart");
      });
    
    return serviceUuid;
   }

   /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace
   */

   public async scheduleMetricMeta(clusterUuid: string, customerAccountKey: number): Promise<string> {

        const on_completion=parseInt(config.sudoryApiDetail.service_result_delete);
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090"; 
        var cronData;
        var cronJobKey;

        //get customerAccountId
        const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);
        if (!customerAccountData) {
          throw new HttpException(404, `customerAccountKey ${customerAccountKey} not found`);
         }    

        const responseResourceGroup: IResourceGroup =  await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);   
        }
        const prometheus = responseResourceGroup.resourceGroupPrometheus;

        cronData = { name: "Get MetricMeta",
                    summary: "Get MetricMeta",
                    cronTab: "*/5 * * * *",
                    clusterId: clusterUuid,
                    reRunRequire: true,
                    scheduleFrom: "",
                    scheduleTo: "",
                    accountId: customerAccountData.customerAccountId,
                    apiUrl: executorServerUrl,
                    apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: "Get MetricMeta",
                            template_uuid: "10000000000000000000000000000007",
                            summary: "Get MetricMeta",
                            subscribed_channel: "nc_metric",
                            on_completion: on_completion,
                            steps: [
                                    {
                                        args: {
                                                url: prometheus,
                                                match_target: "",
                                                metric: "",
                                                limit:""
                                              }
                                    }
                            ]
                        }
                    };
        
        let resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId); 
        cronJobKey = {key: resultNewCron.scheduleKey, jobname: "Get MetricMeta", type: "add"}

        return cronJobKey; 
    }

   /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace
   */

     public async scheduleAlert(clusterUuid: string, customerAccountKey: number): Promise<string> {

        const on_completion=parseInt(config.sudoryApiDetail.service_result_delete);
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090"; 
        var cronData;
        var cronJobKey;

        //get customerAccountId
        const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);
        if (!customerAccountData) {
          throw new HttpException(404, `customerAccountKey ${customerAccountKey} not found`);
         }    

        const responseResourceGroup: IResourceGroup =  await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);   
        }
        const prometheus = responseResourceGroup.resourceGroupPrometheus;


        cronData = { name: "Get Alert Rules & Alert Received",
                    summary: "Get Alert Rules & Alert Received",
                    cronTab: "* * * * *",
                    apiUrl: executorServerUrl,
                    reRunRequire: true,
                    scheduleFrom: "",
                    scheduleTo: "",
                    clusterId: clusterUuid,
                    accountId: customerAccountData.customerAccountId,
                    apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: "Get Alert Rules & Alert Received",
                            template_uuid: "10000000000000000000000000000004",
                            summary: "Get Alert Rules & Alert Received",
                            subscribed_channel: "nc_alert",
                            on_completion: on_completion,
                            steps: [
                                    {
                                        args: {
                                                url: prometheus
                                              }
                                    }
                            ]
                        }
                    };
        
        let resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId); 
        cronJobKey = {key: resultNewCron.scheduleKey, jobname: "Get Alert Rules & Alert Received", type: "add"}
      
        return cronJobKey; 
    }

   /**
   * @param {string} clusterUuid
   * @param {string} resourceType
   */
    public async scheduleResource(clusterUuid: string, customerAccountKey: number, resourceType: string, newCrontab: string): Promise<string> {

        const on_completion=parseInt(config.sudoryApiDetail.service_result_delete);
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        const subscribed_channel = config.sudoryApiDetail.channel_resource;
        var cronData;
        var cronJobKey;

        //get customerAccountId
        const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);
        if (!customerAccountData) {
          throw new HttpException(404, `customerAccountKey ${customerAccountKey} not found`);
         }    

        //sudory template uuid
        const resource_template = [
         {resourceName: "Service", resourceType: "SV", template_uuid:  "00000000000000000000000000000020"},  //service
         {resourceName: "Node", resourceType: "ND", template_uuid:  "00000000000000000000000000000010"},  // node
         {resourceName: "Namespace", resourceType: "NS", template_uuid:  "00000000000000000000000000000004"}, //namespace
         {resourceName: "Pod", resourceType: "PD", template_uuid:  "00000000000000000000000000000002"}, //pod
         {resourceName: "Deployment", resourceType: "DP", template_uuid:  "00000000000000000000000000001002"}, //deployment
         {resourceName: "Statefulset", resourceType: "SS", template_uuid:  "00000000000000000000000000001004"}, //statefulset
         {resourceName: "Daemonset", resourceType: "DS", template_uuid:  "00000000000000000000000000001006"}, //daemonset
         {resourceName: "Replicaset", resourceType: "RS", template_uuid:  "00000000000000000000000000001008"}, //replicaset
         {resourceName: "PVC", resourceType: "PC", template_uuid:  "00000000000000000000000000000018"}, //pvc
         {resourceName: "Secret", resourceType: "SE", template_uuid:  "00000000000000000000000000000014"},  //secret
         {resourceName: "Endpoint", resourceType: "EP", template_uuid:  "00000000000000000000000000000016"}, //endpoint
         {resourceName: "Configmap", resourceType: "CM", template_uuid:  "00000000000000000000000000000006"}, //configmap
         {resourceName: "Ingress", resourceType: "IG", template_uuid:  "00000000000000000000000000002002"}, //ingress
         {resourceName: "PV", resourceType: "PV", template_uuid:  "00000000000000000000000000000012"},  //pv
         {resourceName: "Storage Class", resourceType: "SC", template_uuid:  "00000000000000000000000000003002"}  //storageclass
        //template_uuid: "00000000000000000000000000003002",
        //template_uuid: "00000000000000000000000000003002";
        ];
        
        const selectedTemplate = resource_template.find( template => {
            return template.resourceType === resourceType;
        });

        if (!selectedTemplate) {
            throw new HttpException(404, "not supported resourceType");
        }; 

        const template_uuid = selectedTemplate.template_uuid; 
        const scheduleName = "K8s interface for " + selectedTemplate.resourceName;
        const scheduleSummary = "K8s interface for " + selectedTemplate.resourceName;
 
        cronData = { name: scheduleName,
                    summary: scheduleSummary,
                    cronTab: newCrontab,
                    apiUrl: executorServerUrl,
                    reRunRequire: true,
                    scheduleFrom: "",
                    scheduleTo: "",
                    clusterId: clusterUuid,
                    //accountId: customerAccountData.customerAccountId,
                    apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: scheduleName,
                            template_uuid: template_uuid,
                            summary: scheduleSummary,
                            subscribed_channel: subscribed_channel,
                            on_completion: on_completion,
                            steps: [
                                    {
                                        args: {
                                                labels: {}
                                              }
                                    }
                            ]
                        }
                    };
        let resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId); 
    
        cronJobKey = {key: resultNewCron.scheduleKey, jobname: scheduleName, type: "add"}
            
        return cronJobKey; 
    }

   /**
   * @param {string} clusterUuid
   */
    public async scheduleMetricReceived(clusterUuid: string, customerAccountKey: number): Promise<object> {

        const on_completion=parseInt(config.sudoryApiDetail.service_result_delete);
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        const subscribed_channel = config.sudoryApiDetail.channel_metric_received;
        //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090"; 
        var cronData;
        var cronJobKey =[];
        var DistinctJobList;

        //get customerAccountId
        const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);
        if (!customerAccountData) {
            throw new HttpException(404, `customerAccountKey ${customerAccountKey} not found`);
            } 

        const responseResourceGroup: IResourceGroup =  await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);   
        }
        const prometheus = responseResourceGroup.resourceGroupPrometheus;

        // get distinct data of job... 
        DistinctJobList = await this.MetricMetaService.getDistinctJobOfMetricMetabyUuid(clusterUuid); 
        if (!DistinctJobList) {
            throw new HttpException(404, `No metric Job information with the clusterUuid: ${clusterUuid}`);   
        }
 
        // loop to schedule MetricReceived by 
        for (let i=0; i<DistinctJobList.length; i++){
            let targetJob = DistinctJobList[i].metricMetaTargetJob
            let matricQuery = `{job="` + targetJob + `"}`;
            let matricName = "MetricReceived-" + targetJob; 
            let matricSummary = targetJob;
            
            cronData = { name: matricName,
                        summary: matricSummary,
                        cronTab: "*/5 * * * *",
                        apiUrl: executorServerUrl,
                        clusterId: clusterUuid,
                        //accountId: customerAccountData.customerAccountId,
                        reRunRequire: true,
                        scheduleFrom: "",
                        scheduleTo: "",
                        apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: matricName,
                            template_uuid: "10000000000000000000000000000001",
                            summary: matricSummary,
                            subscribed_channel: subscribed_channel,
                            on_completion: on_completion,
                            steps: [
                                    {
                                        args: {
                                                url: prometheus,
                                                query: matricQuery
                                            }
                                    }
                            ]
                        }
            };
            
            let resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId); 
            cronJobKey[i] = {key: resultNewCron.scheduleKey, jobname: targetJob, type: "add"}

        } // end of for loop
        return cronJobKey;            
    }


    public async scheduleSyncMetricReceived(clusterUuid: string): Promise<object> {

        const nexclipperApiUrl = config.appUrl + ":" + config.appPort + "/executor/syncMetricReceived";
        const cronData = { name: "SyncMetricReceived",
        summary: "SyncMetricReceived",
        cronTab: `*/5 * * * *`,
        apiUrl: nexclipperApiUrl,
        reRunRequire: true,
        scheduleFrom: "",
        scheduleTo: "",
        clusterId: clusterUuid,
//        //accountId: getCustomerAccount.customerAccountId,
        apiBody:
            {
                clusterUuid: clusterUuid
            }
      };
      const getResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid); 
      const getCustomerAccount = await this.customerAccountService.getCustomerAccountByKey(getResourceGroup.customerAccountKey); 
      const resultSchedule = await this.schedulerService.createScheduler(cronData, getCustomerAccount.customerAccountId); 
      console.log (resultSchedule); 
      return resultSchedule; 
    }

   /**
   * @param {string} clusterUuid
   */
    public async syncMetricReceived(clusterUuid: string): Promise<object> {
        
        let distinctJobList;
        let targetJobDbAll;
        let targetJobDb = [];
        let targetJobCron = [];
        let on_completion=parseInt(config.sudoryApiDetail.service_result_delete);
        let executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        let subscribed_channel = config.sudoryApiDetail.channel_metric_received;
        var cronJobKey = [];
        var cronJobKey_new =[];
        var cronJobKey_cancel =[];

        //get customerAccountId
        const resourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid); 
        const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(resourceGroup.customerAccountKey);
    
        // validate clusterUuid
        const responseResourceGroup: IResourceGroup =  await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);   
        }
        let prometheus = responseResourceGroup.resourceGroupPrometheus;
        //pull metric target
        distinctJobList = await this.MetricMetaService.getDistinctJobOfMetricMetabyUuid(clusterUuid); 
        if (!distinctJobList) {
            throw new HttpException(404, `No metric Job information with the clusterUuid: ${clusterUuid}`);   
        }
        console.log ("######## target job from db");
        targetJobDbAll = JSON.parse(JSON.stringify(distinctJobList));
        targetJobDb = targetJobDbAll.map(function (obj) {return obj.metricMetaTargetJob})
        console.log (targetJobDb);

        //pull active metric-received job from nc-cron
       const resultFromCron = await this.schedulerService.getSchedulerByClusterId(clusterUuid);
       console.log ("######## target job from scheduler");
       let newList = [];
       resultFromCron.map((data)=>{
            const {scheduleApiBody} = data;
            newList.push ({scheduleApiBody});
       });

       //filter only for metric_received
       let newFilterList = newList.filter(data => data.scheduleApiBody.subscribed_channel === "nc_metric_received");
       
       //pull metricMetaTargetJob
       for (let i=0; i<Object.keys(newFilterList).length; i++) {
            let steps = newFilterList[i].scheduleApiBody.steps;
            let query = steps.map(obj => {return obj.args.query}); 
            let job = query.toString().substring(query.toString().indexOf('"')+1, query.toString().lastIndexOf('"'));
            targetJobCron[i] = job;
       }
       console.log("###### from Cron ###############")
       console.log (targetJobCron);

       //start metric-received feeds for any new targets
       let newTargetJob = targetJobDb.filter(x => !targetJobCron.includes(x));
       console.log ("filter result for new  "); 
       console.log (newTargetJob);

       // call scheduleMetricReceived() with loop
       for (let n=0; n<Object.keys(newTargetJob).length; n++) {
            let targetJob = newTargetJob[n]
            let matricQuery = `{job="` + targetJob + `"}`;
            let matricName = "MetricReceived-" + targetJob; 
            let matricSummary = targetJob;
            let cronData = { name: matricName,
                        summary: matricSummary,
                        cronTab: "*/5 * * * *",
                        apiUrl: executorServerUrl,
                        clusterId: clusterUuid,
                        //accountId: customerAccountData.customerAccountId,
                        reRunRequire: true,
                        scheduleFrom: "",
                        scheduleTo: "",
                        apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: matricName,
                            template_uuid: "10000000000000000000000000000001",
                            summary: matricSummary,
                            subscribed_channel: subscribed_channel,
                            on_completion: on_completion,
                            steps: [
                                    {
                                        args: {
                                                url: prometheus,
                                                query: matricQuery
                                            }
                                    }
                            ]
                        }
            };
            let resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId); 
            cronJobKey_new[n] = {key: resultNewCron.scheduleKey, jobname: targetJob, type: "add"}
       }
        
        //cancel metric-received feeds for any retuired targets
        // call cancel method with loop
        let cancelTargetJob = targetJobCron.filter(x => !targetJobDb.includes(x)); 
        console.log ("filter result for cancellation "); 
        console.log (cancelTargetJob);  
        //search the cron job and run cancellation loop

        for (let n=0; n<Object.keys(cancelTargetJob).length; n++) {
            let targetJob = cancelTargetJob[n]
            let scheduleName = "MetricReceived-" + targetJob; 
            let resultFromCron = await this.schedulerService.getSchedulerByScheduleNameByClusterId(scheduleName, clusterUuid);
            let cancelFromCron = await this.schedulerService.cancelCronScheduleBySchedulerId(resultFromCron.scheduleId);
            cronJobKey_cancel[n] = {key: cancelFromCron.scheduleKey, jobname: targetJob, type: "cancel"}
        }
        cronJobKey.concat(cronJobKey_new);
        cronJobKey.concat(cronJobKey_cancel);
        return cronJobKey;
    }    
    
    /**
     * @param {SudoryWebhookDto} DataSetFromSudory
     */
    public async processSudoryWebhook(DataSetFromSudory: SudoryWebhookDto): Promise<object> {

        const uuid = require('uuid');
        const sudoryWebhookId = uuid.v1();
        var serviceResult;

        if (DataSetFromSudory.result==="") {
            serviceResult = "";
        }
        else {
            serviceResult = JSON.parse(DataSetFromSudory.result);
        }

        const insertData = {
            sudoryWebhookId: sudoryWebhookId,
            createdAt: new Date(),
            createdBy: "SYSTEM",
            serviceUuid: DataSetFromSudory.service_uuid,
            clusterUuid: DataSetFromSudory.cluster_uuid,
            status: DataSetFromSudory.status,
            serviceName: DataSetFromSudory.service_name,
            serviceResult: serviceResult,
            serviceResultType: DataSetFromSudory.result_type,
            statusDescription: DataSetFromSudory.status_description,
            stepCount: DataSetFromSudory.step_count,
            stepPosition: DataSetFromSudory.step_position,
            assignedClientUuid: DataSetFromSudory.assgined_client_uuid,
            templateUuid: DataSetFromSudory.template_uuid,
        }
        console.log (insertData); 
        const resultSudoryWebhook = await this.sudoryWebhook.create(insertData); 

        const data = {updatedAt: new Date(), 
                      updatedBy: "SYSTEM",
                      status: DataSetFromSudory.status,
                      statusDescription: DataSetFromSudory.status_description,
        }; 
        const query = {where: {serviceUuid:DataSetFromSudory.service_uuid}};
        const resultExecutorService = await this.executorService.update(data, query);
        console.log (resultExecutorService); 
        return resultSudoryWebhook;
    }

    /**
     * @param {string} serviceUuid
     */
     public async getSudoryWebhook(serviceUuid: string): Promise<object> {

        console.log(serviceUuid); 
        const resultSudoryWebhook = await this.sudoryWebhook.findOne({where: { serviceUuid }}); 
        return resultSudoryWebhook;
    }


    /**
     * @param {string} clusterUuid
     * @param {string} queryType
     * @param {string} stepQuery
     */
     public async postMetricRequest(clusterUuid: string, queryType: string, stepQuery: string, customerAccountKey: number): Promise<object> {
        console.log ("method start");
        let name = "postMetricReqeust for Incident Attachment";
        let summary = "postMetricReqeust for Incident Attachment";
        let templateUuid = "";
        //let url = "http://kps-kube-prometheus-stack-prometheus.monitor.svc.cluster.local:9090";
        let steps;
        let start = new Date();
        start.setHours(start.getHours()- 1);
        let startString = start.toISOString();
        let endString = new Date().toISOString();
        let query = stepQuery; 
        let sudoryChannel = config.sudoryApiDetail.channel_wehbook; 

        const ResourceGroup: IResourceGroup = await this.resourceGroup.findOne({where: {resourceGroupUuid: clusterUuid}}); 
        let url = ResourceGroup.resourceGroupPrometheus; 

        if (queryType == "range") {
            templateUuid = "10000000000000000000000000000002";
            steps = [{args: {url: url, query: stepQuery, start: startString, end: endString, step: "15s"}}]; 
        }
        else {
            templateUuid = "10000000000000000000000000000001";  
            steps = [{args:{url: url, query: query}}];
        }
        const postMetricRequest = await this.postExecuteService(name, summary, clusterUuid, templateUuid, steps, customerAccountKey, sudoryChannel);
        return postMetricRequest;
    }

    public async getExecutorServicebyExecutorServiceId(executorServiceId: string): Promise<IExecutorService>{

        const getExecutorService: IExecutorService = await this.executorService.findOne({where: {executorServiceId}});
        return getExecutorService;
    }

    public async getExecutorServicebyCustomerAccountId(customerAccountId: string): Promise<IExecutorService[]>{

        const getCustomerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);
        let customerAccountKey = getCustomerAccount.customerAccountKey; 

        const getExecutorServiceAll: IExecutorService[] = await this.executorService.findAll({where: {customerAccountKey}}
        );
        return getExecutorServiceAll;
    }  

}
export default executorService;