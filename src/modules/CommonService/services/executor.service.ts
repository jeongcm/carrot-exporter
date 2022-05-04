//import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ResourceGroupExecutorDto } from '@/modules/Resources/dtos/resourceGroup.dto';
import { IExecutorClient, ExecutorResourceDto, ExecutorResultDto } from '@/modules/CommonService/dtos/executor.dto';

//import TableIdService from '@/modules/CommonService/services/tableId.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import { isBreakOrContinueStatement } from 'typescript';

class executorService {
//    public tableIdService = new TableIdService();
    public customerAccountService = new CustomerAccountService();
    public resourceGroupService = new ResourceGroupService();

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

    const sudoryCreateCluster = {name: apiDataName, summary: apiDataSummary, polling_option: apiDataOption }; 
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
    return executorClient;
  }

  /**
   * @param  {string} clusterUuid
   */
     public async checkExecutorClient(clusterUuid: string): Promise<string> {

      var clientUuid = "";

      var executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession;
      const sessionQueryParameter = `?q=(eq%20user_uuid%20"${clusterUuid}")`; 
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

      return clientUuid;
     }  
  /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace 
   */
     public async installKpsOnResourceGroup(clusterUuid: string, targetNamespace: string ): Promise<string> {

      var serviceUuid ="";
      var executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
      //var sudoryServiceDataSteps = new Array(); 
      //sudoryServiceDataSteps = [{name: "kps", chart_name:"kube-prometheus-stack",repo_url:"https://prometheus-community.github.io/helm-charts", namespace: targetNamespace,chart_version:"35.0.3",values:{}}]; 
    
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

      //console.log("sudory message body", sudoryServiceData);
      //console.log("sudory server url", executorServerUrl);

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

      return serviceUuid;
     }          

  /**
   * @param {ExecutorResourceDto} resourceInputData
   */
 public async requestResourceListByExecutor(resourceInputData: ExecutorResourceDto ): Promise<string> {

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

}
export default executorService;