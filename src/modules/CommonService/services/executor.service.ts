//import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ResourceGroupExecutorDto } from '@/modules/Resources/dtos/resourceGroup.dto';
import { IExecutorClient, ExecutorResultDto, ExecutorResourceListDto, IExecutorClientCheck } from '@/modules/CommonService/dtos/executor.dto';

//import TableIdService from '@/modules/CommonService/services/tableId.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
//import { isBreakOrContinueStatement } from 'typescript';
//import { template } from 'lodash';
import MetricMetaService from '@/modules/Metric/services/metricMeta.service';

class executorService {
//    public tableIdService = new TableIdService();
    public customerAccountService = new CustomerAccountService();
    public resourceGroupService = new ResourceGroupService();
    public MetricMetaService = new MetricMetaService();

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
    
    console.log("######");  
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
      const ResponseResoureGroup: IResourceGroup = await this.resourceGroupService.createResourceGroup(resourceGroup, currentUserId, customerAccountKey); 
      console.log ("Success to create ResponseGroup: ", ResponseResoureGroup.resourceGroupId)
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
     public async checkExecutorClient(clusterUuid: string): Promise<IExecutorClientCheck> {
      var clientUuid = "";
      var resourceJobKey = [];
      var executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession;
      const sessionQueryParameter = `?q=(eq%20cluster_uuid%20"${clusterUuid}")`; 
      executorServerUrl = executorServerUrl + sessionQueryParameter;
      await axios(
        {
          method: 'get',
          url: `${executorServerUrl}`,
          headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
        }).then(async (res: any) => {
          if(!res.data[0]) {  
            console.log(`Executor/Sudory client not found yet from cluster: ${clusterUuid}`); 
            return clientUuid;
          };
          const clientData = Object.assign({},res.data[0]); 
          clientUuid = clientData.uuid;
          console.log(`Successful to run API to search Executor/Sudory client ${clientUuid}`);
        }).catch(error => {
          console.log(error);
          throw new HttpException(500, "Unknown error while searching executor/sudory client");
        });

    // scheduleResource - node
      await this.scheduleResource(clusterUuid, "ND"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "ND", cronKey: res});
            console.log(`Submitted resource ND schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource ND schedule request for clsuter:${clusterUuid}`);
        }); //end of catch

    // scheduleResource - pod
      await this.scheduleResource(clusterUuid, "PD"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "PD", cronKey: res});       
            console.log(`Submitted resource PD schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource PD schedule request for clsuter:${clusterUuid}`);
        }); //end of catch

    // scheduleResource - namespace
      await this.scheduleResource(clusterUuid, "NS"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "NS", cronKey: res});           
            console.log(`Submitted resource NS schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource NS schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - service
      await this.scheduleResource(clusterUuid, "SV"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "SV", cronKey: res});    
            console.log(`Submitted resource SV schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource SV schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - deployment
      await this.scheduleResource(clusterUuid, "DP"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "DP", cronKey: res});        
            console.log(`Submitted resource DP schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource DP schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - statefulset
      await this.scheduleResource(clusterUuid, "SS"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "SS", cronKey: res});            
            console.log(`Submitted resource SS schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource SS schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - daemonset
      await this.scheduleResource(clusterUuid, "DS"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "DS", cronKey: res});            
            console.log(`Submitted resource DS schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource DS schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - replicaset
      await this.scheduleResource(clusterUuid, "RS"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "RS", cronKey: res});            
            console.log(`Submitted resource RS schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource RS schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - pvc
      await this.scheduleResource(clusterUuid, "PC"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "PC", cronKey: res});            
            console.log(`Submitted resource PC schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource PC schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Secret
      await this.scheduleResource(clusterUuid, "SE"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "SE", cronKey: res});            
            console.log(`Submitted resource SE schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource SE schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Endpoint
      await this.scheduleResource(clusterUuid, "EP"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "EP", cronKey: res});            
            console.log(`Submitted resource EP schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource EP schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Configmap
      await this.scheduleResource(clusterUuid, "CM"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "CM", cronKey: res});            
            console.log(`Submitted resource CM schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource CM schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Ingress
      await this.scheduleResource(clusterUuid, "IG"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "IG", cronKey: res});            
            console.log(`Submitted resource IG schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource IG schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - PV
      await this.scheduleResource(clusterUuid, "PV"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "PV", cronKey: res});            
            console.log(`Submitted resource PV schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource PV schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

    // scheduleResource - Storage Class
      await this.scheduleResource(clusterUuid, "SC"
        ).then(async (res: any) =>{
            resourceJobKey.push({resourceType: "SC", cronKey: res});            
            console.log(`Submitted resource SC schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
            console.log(error);
            console.log(`confirmed the executor/sudory client installed but fail to submit resource SC schedule request for clsuter:${clusterUuid}`);
        }); //end of catch        

        const responseExecutorClientCheck = {resourceJobKey, clientUuid}; 

    return responseExecutorClientCheck;
     }  

  /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace 
   */
     public async installKpsOnResourceGroup(clusterUuid: string, targetNamespace: string, systemId: string ): Promise<string> {

      var serviceUuid ="";
      var executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;    
      const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090"; 
      const sudoryServiceData = {cluster_uuid: clusterUuid, 
                                 name: "kps helm installation", 
                                 template_uuid: "20000000000000000000000000000001", 
                                 summary: "kps helm installation", 
                                 subscribe_channel: "", 
                                 steps: [
                                    {args: 
                                        {name: 'kps', 
                                         chart_name:'kube-prometheus-stack',
                                         repo_url:'https://prometheus-community.github.io/helm-charts', 
                                         namespace: targetNamespace,
                                         chart_version:'35.0.3',
                                         values:{}
                                        }
                                    }
                                ] 
                                };
      await axios(
        {
          method: 'post',
          url: `${executorServerUrl}`,
          data: sudoryServiceData,
          headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
        }).then(async (res: any) => {
          serviceUuid = res.data.uuid
          console.log(`Submit kps chart installation reqeust on ${clusterUuid} cluster successfully, serviceUuid is ${serviceUuid}`);

        }).catch(error => {
          console.log(error);
          throw new HttpException(500, "Unknown error to install kps chart");
        });

      // update ResourceGroup - resourceGroupPrometheus
      const resourceGroup = {resourceGroupPrometheus: prometheus}; 
      // get system user id


      try {  
        const ResponseResoureGroup: IResourceGroup = await this.resourceGroupService.updateResourceGroupByUuid(clusterUuid, resourceGroup, systemId); 
        console.log ("Success to create ResponseGroup: ", ResponseResoureGroup.resourceGroupId)
        } catch (error) {
        console.log (error);
        throw new HttpException(500, `Error on creating cluster ${clusterUuid}`);
        }     

      //schedule metricMeta  
      await this.scheduleMetricMeta(clusterUuid
      ).then(async (res: any) =>{
        console.log(`Submitted metricmeta schedule reqeust on ${clusterUuid} cluster successfully`);
      }).catch(error => {
        console.log(error);
        throw new HttpException(500, "Submitted kps chart installation request but fail to schedule MetricMeta; ");
      }); //end of catch
 
      //schedule alert rules & received
      await this.scheduleAlert(clusterUuid
        ).then(async (res: any) =>{
          console.log(`Submitted alert feeds schedule reqeust on ${clusterUuid} cluster successfully`);
        }).catch(error => {
          console.log(error);
          throw new HttpException(500, "Submitted kps chart installation request but fail to schedule alert feeds; ");
        }); //end of catch
  
      
      return serviceUuid;
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

   public async scheduleMetricMeta(clusterUuid: string): Promise<string> {

        const cronUrl = config.ncCronApiDetail.baseURL; 
        const authToken = config.ncCronApiDetail.authToken;
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090"; 
        var cronData;
        var cronJobKey;

        const responseResourceGroup: IResourceGroup =  await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);   
        }
        const prometheus = responseResourceGroup.resourceGroupPrometheus;

        cronData = { name: "Get MetricMeta",
                    summary: "Get MetricMeta",
                    cronTab: "* * * * *",
                    apiUrl: executorServerUrl,
                    apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: "Get MetricMeta",
                            template_uuid: "10000000000000000000000000000007",
                            summary: "Get MetricMeta",
                            subscribed_channel: "nc_metric",
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
        
        await axios(
            {
            method: 'post',
            url: `${cronUrl}`,
            data: cronData,
            headers: { 'X_AUTH_TOKEN': `${authToken}` }
            }).then(async (res: any) => {
            //    console.log(res);                              
                cronJobKey = res.data.data.scheduleKey
                console.log(`Submit MetricMeta scheduling on ${clusterUuid} cluster successfully, cronJobKey is ${cronJobKey}`);    
            }).catch(error => {
                console.log(error);
                throw new HttpException(500, "Unknown error to request MetricMeta scheduling");
            });
       
        return cronJobKey; 
    }

   /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace
   */

     public async scheduleAlert(clusterUuid: string): Promise<object> {

        const cronUrl = config.ncCronApiDetail.baseURL; 
        const authToken = config.ncCronApiDetail.authToken;
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090"; 
        var cronData;
        var cronJobKey;

        const responseResourceGroup: IResourceGroup =  await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);   
        }
        const prometheus = responseResourceGroup.resourceGroupPrometheus;


        cronData = { name: "Get Alert Rules & Alert Received",
                    summary: "Get Alert Rules & Alert Received",
                    cronTab: "* * * * *",
                    apiUrl: executorServerUrl,
                    apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: "Get Alert Rules & Alert Received",
                            template_uuid: "10000000000000000000000000000004",
                            summary: "Get Alert Rules & Alert Received",
                            subscribed_channel: "nc_alert",
                            steps: [
                                    {
                                        args: {
                                                url: prometheus
                                              }
                                    }
                            ]
                        }
                    };
        
        await axios(
            {
            method: 'post',
            url: `${cronUrl}`,
            data: cronData,
            headers: { 'X_AUTH_TOKEN': `${authToken}` }
            }).then(async (res: any) => {
            //    console.log(res);                              
                cronJobKey = res.data.data.scheduleKey
                console.log(`Submit alert feeds scheduling on ${clusterUuid} cluster successfully, cronJobKey is ${cronJobKey}`);    
            }).catch(error => {
                console.log(error);
                throw new HttpException(500, "Unknown error to request Alert feeds scheduling");
            });
       
        return cronJobKey; 
    }

   /**
   * @param {string} clusterUuid
   * @param {string} resourceType
   */
    public async scheduleResource(clusterUuid: string, resourceType: string): Promise<string> {

        const cronUrl = config.ncCronApiDetail.baseURL; 
        const authToken = config.ncCronApiDetail.authToken;
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        const subscribed_channel = config.sudoryApiDetail.channel_resource;
        var cronData;
        var cronJobKey;
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
        const d = new Date();
        var newCrontab;
        let seconds = d.getSeconds();
        let minutes = d.getMinutes();
        if (seconds>45) {
            newCrontab = minutes+2 + " * * * *";
        } 
        else {
            newCrontab = minutes+1 + " * * * *";
        }
        console.log("new crontab", newCrontab);

        cronData = { name: scheduleName,
                    summary: scheduleSummary,
                    cronTab: newCrontab,
                    apiUrl: executorServerUrl,
                    apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: scheduleName,
                            template_uuid: template_uuid,
                            summary: scheduleSummary,
                            subscribed_channel: subscribed_channel,
                            steps: [
                                    {
                                        args: {
                                                labels: {}
                                              }
                                    }
                            ]
                        }
                    };
        
        await axios(
            {
            method: 'post',
            url: `${cronUrl}`,
            data: cronData,
            headers: { 'X_AUTH_TOKEN': `${authToken}` }
            }).then(async (res: any) => {                            
                cronJobKey = res.data.data.scheduleKey;
                console.log("###########cronJobKey", cronJobKey); 
                console.log(`Submit Resource-Node feeds scheduling on ${clusterUuid} cluster successfully, cronJobKey is ${cronJobKey}`);    
            }).catch(error => {
                console.log(error);
                throw new HttpException(500, "Unknown error to request resource-node feeds scheduling");
            });
        console.log("CRONJOBKEY in Function: ", cronJobKey); 

        return cronJobKey; 
    }


   /**
   * @param {string} clusterUuid
   */
    public async scheduleMetricReceived(clusterUuid: string): Promise<object> {

        const cronUrl = config.ncCronApiDetail.baseURL; 
        const authToken = config.ncCronApiDetail.authToken;
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        const subscribed_channel = config.sudoryApiDetail.channel_metric_received;
        //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090"; 
        var cronData;
        var cronJobKey;
        var DistinctJobList;

        const responseResourceGroup: IResourceGroup =  await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);   
        }
        const prometheus = responseResourceGroup.resourceGroupPrometheus;

        // get distinct data of job... 
        DistinctJobList = await this.MetricMetaService.getDistinctJobOfMetricMetabyUuid(clusterUuid); 
        if (!DistinctJobList) {
            throw new HttpException(404, `No metric information with the clusterUuid: ${clusterUuid}`);   
        }
        // loop to schedule MetricReceived by 
        for (let i=0; i<DistinctJobList.length; i++){
            let targetJob = DistinctJobList[i].metricMetaTargetJob
            let matricQuery = "{job=" + targetJob + "}";
            let matricName = "MetricReceived" + targetJob; 
            let matricSummary = "MetricReceived" + targetJob; 
            
            cronData = { name: matricName,
                        summary: matricSummary,
                        cronTab: "* * * * *",
                        apiUrl: executorServerUrl,
                        apiBody:
                        {
                            cluster_uuid: clusterUuid,
                            name: matricName,
                            template_uuid: "10000000000000000000000000000001",
                            summary: matricSummary,
                            subscribed_channel: subscribed_channel,
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
        //interface with Cron
            console.log(cronData);            
            await axios(
                {
                method: 'post',
                url: `${cronUrl}`,
                data: cronData,
                headers: { 'X_AUTH_TOKEN': `${authToken}` }
                }).then(async (res: any) => {                            
                    cronJobKey[i] = res.data.data.scheduleKey;
                    console.log(`Submit metric-received feeds - job ${targetJob} scheduling on ${clusterUuid} cluster successfully, cronJobKey is ${cronJobKey}`);    
                }).catch(error => {
                    console.log(error);
                    throw new HttpException(500, "Unknown error to request metric-received feeds scheduling");
                });
        } // end of for loop
        return cronJobKey;            
    }

    public sleep (ms) {
        return new Promise((resolve)=> {
            setTimeout (resolve, ms); 
        }); 
    }
}
export default executorService;