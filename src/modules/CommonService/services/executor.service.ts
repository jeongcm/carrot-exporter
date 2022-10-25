import DB from '@/database';
import axios from 'common/httpClient/axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ResourceGroupExecutorDto } from '@/modules/Resources/dtos/resourceGroup.dto';
import { IExecutorClient, ExecutorResultDto, ExecutorResourceListDto, SudoryWebhookDto } from '@/modules/CommonService/dtos/executor.dto';

import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import MetricMetaService from '@/modules/Metric/services/metricMeta.service';
import SchedulerService from '@/modules/Scheduler/services/scheduler.service';

import { IExecutorService } from '@/common/interfaces/executor.interface';
import { ISudoryWebhook } from '@/common/interfaces/sudoryWebhook.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
//import { IIncidentAction } from '@/common/interfaces/incidentAction.interface';
import IncidentService from '@/modules/Incident/services/incident.service';
import TableIdService from './tableId.service';
//import { IResponseIssueTableIdDto } from '../dtos/tableId.dto';
const { Op } = require('sequelize');
import UploadService from '@/modules/CommonService/services/fileUpload.service';
import MetricService, {IMetricQueryBody} from "@modules/Metric/services/metric.service";
//import { updateShorthandPropertyAssignment } from 'typescript';
//import { IIncidentActionAttachment } from '@/common/interfaces/incidentActionAttachment.interface';

class executorService {
  //    public tableIdService = new TableIdService();
  public customerAccountService = new CustomerAccountService();
  public resourceGroupService = new ResourceGroupService();
  public MetricMetaService = new MetricMetaService();
  public schedulerService = new SchedulerService();
  public incidentService = new IncidentService();
  public metricService = new MetricService();

  public sudoryWebhook = DB.SudoryWebhook;
  public executorService = DB.ExecutorService;
  public resourceGroup = DB.ResourceGroup;
  public exporters = DB.Exporters;
  public incident = DB.Incident;
  public tableIdService = new TableIdService();
  public incidentAction = DB.IncidentAction;
  public incidentActionAttachment = DB.IncidentActionAttachment;
  public fileUploadService = new UploadService();

  /**
   * @param {string} serviceUuid
   */
  public async checkExecutorResourceResponse(serviceUuid: string): Promise<ExecutorResultDto> {
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService + '/' + serviceUuid + '/result';

    let clusterUuid = '';
    let name = '';
    const result = [];
    let status = 'Not_Ready';

    await axios({
      method: 'get',
      url: `${executorServerUrl}`,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        const statusCode = res.data.status;
        if (statusCode != 4) {
          console.log('result is not ready');
          return;
        }
        //serviceUuid = res.data.uuid;
        clusterUuid = res.data.cluster_uuid;
        name = res.data.name;
        status = 'Ready';
        console.log(`patched the result of serviceUuid: ${serviceUuid}`);

        const resourceDetails = JSON.parse(res.data.result);
        const itemsLength = resourceDetails.items.length;

        for (let i = 0; i < itemsLength; i++) {
          const resourceName = resourceDetails.items[i];
          result.push({
            name: resourceName.metadata.name,
            resource_uuid: resourceName.metadata.uid,
            creation: resourceName.metadata.creationTimestamp,
          });
        }
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of serviceUuid: ${serviceUuid}`);
      });

    const executorResult = { serviceUuid: serviceUuid, clusterUuid: clusterUuid, name: name, result: result, status: status };
    return executorResult;
  }

  /**
   * @param {string} serviceUuid
   */
  public async checkExecutorResponse(serviceUuid: string): Promise<ExecutorResultDto> {
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService + '/' + serviceUuid + '/result';

    let clusterUuid = '';
    let name = '';
    let result = [];
    let status = 'Not_Ready';

    await axios({
      method: 'get',
      url: `${executorServerUrl}`,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        const statusCode = res.data.status;
        if (statusCode != 4) {
          console.log('result is not ready');
          return;
        }
        //serviceUuid = res.data.uuid;
        clusterUuid = res.data.cluster_uuid;
        name = res.data.name;
        result = JSON.parse(res.data.result);
        status = 'Ready';
        console.log(`patched the result of serviceUuid -- ${serviceUuid}`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of serviceUuid: ${serviceUuid}`);
      });

    const executorResult = { serviceUuid: serviceUuid, clusterUuid: clusterUuid, name: name, result: result, status: status };
    return executorResult;
  }

  /**
   * @param  {ResourceGroupExecutorDto} ResourceGroupExecutorData
   * @param  {string} currentUserId
   */
  public async registerExecutorClient(requestExecutorClient: ResourceGroupExecutorDto, currentUserId: string): Promise<IExecutorClient> {
    let clusterUuid = '';
    let token = '';

    const executorServerClusterUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathCreateCluster;
    const executorServerTokenUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathCreateToken;
    const executorServerBaseUrl = config.sudoryApiDetail.baseURL;
    const executorRepoName = config.sudoryApiDetail.repoName;
    const executorRepoUrl = config.sudoryApiDetail.repoUrl;
    const customerAccountId = requestExecutorClient.customerAccountId;
    const resourceGroupName = requestExecutorClient.resourceGroupName;
    const resourceGroupProvider = requestExecutorClient.resourceGroupProvider;
    const resourceGroupPlatform = requestExecutorClient.resourceGroupPlatform;
    const resourceGroupSudoryNamespace = requestExecutorClient.resourceGroupSudoryNamespace || '';
    const resourceGroupKpsLokiNamespace = requestExecutorClient.resourceGroupKpsLokiNamespace || '';

    const customerAccountData = await this.customerAccountService.getCustomerAccountById(customerAccountId);
    if (!customerAccountData) {
      throw new HttpException(404, `customerAccountId ${customerAccountId} not found`);
    }

    const customerAccountName = customerAccountData.customerAccountName;
    const customerAccountKey = customerAccountData.customerAccountKey;

    const apiDataName = resourceGroupName;
    const apiDataSummary = `${resourceGroupName} for ${customerAccountName}`;
    const apiDataOption = { addtionalProp1: {} };

    const sudoryCreateCluster = { name: apiDataName, summary: apiDataSummary, polling_option: apiDataOption, polling_limit: 0 };
    let sudoryCreateClusterResponse;

    await axios({
      method: 'POST',
      url: `${executorServerClusterUrl}`,
      data: sudoryCreateCluster,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        console.log('success to create sudory cluster');
        sudoryCreateClusterResponse = res.data;
      })
      .catch(error => {
        console.log(error);
        return error;
      });
    clusterUuid = sudoryCreateClusterResponse.uuid;

    let sudoryCreateTokenResponse;
    const sudoryCreateTokenData = { name: apiDataName, cluster_uuid: clusterUuid, summary: apiDataSummary };

    await axios({
      method: 'POST',
      url: `${executorServerTokenUrl}`,
      data: sudoryCreateTokenData,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        console.log('success to create cluster token');
        sudoryCreateTokenResponse = res.data;
      })
      .catch(error => {
        console.log(error);
        return error;
      });

    token = sudoryCreateTokenResponse.token;

    const executorClient: IExecutorClient = {
      clusterUuid: clusterUuid,
      token: token,
      exectuorServerUrl: executorServerBaseUrl,
      repoName: executorRepoName,
      repoUrl: executorRepoUrl,
    };

    const resourceGroup = {
      resourceGroupName: resourceGroupName,
      resourceGroupDescription: resourceGroupName,
      resourceGroupProvider: resourceGroupProvider,
      resourceGroupPlatform: resourceGroupPlatform,
      resourceGroupUuid: clusterUuid,
      resourceGroupPrometheus: '',
      resourceGroupSudoryNamespace: resourceGroupSudoryNamespace,
      resourceGroupKpsLokiNamespace: resourceGroupKpsLokiNamespace,
    };

    try {
      const ResponseResoureGroup: Object = await this.resourceGroupService.createResourceGroup(resourceGroup, currentUserId, customerAccountKey);
      console.log('Success to create ResponseGroup: ', ResponseResoureGroup);
    } catch (error) {
      console.log(error);
      throw new HttpException(500, `Error on creating cluster ${resourceGroupName}`);
    }

    try {
      //await scheduleResource(clusterUuid);
    } catch (error) {
      console.log(error);
      throw new HttpException(500, `Registered a cluster but error on scheduling resource interfaces ${resourceGroupName}`);
    }
    return executorClient;
  }

  /**
   * @param {string} clusterUuid
   * @param {number} customerAccountKey
   * @param {string} sudoryNamespace
   */
  public async checkExecutorClient(clusterUuid: string, sudoryNamespace: string, customerAccountKey: number): Promise<object> {
    let clientTrueFalse = false;
    const resourceJobKey = [];
    //improvement/713, Aug30 2022
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession + '/cluster/' + clusterUuid + '/alive';

    const resourceCron = config.resourceCron;
    //const sessionQueryParameter = `?q=(eq%20cluster_uuid%20"${clusterUuid}")`;
    //executorServerUrl = executorServerUrl + sessionQueryParameter;
    console.log('bug/736');
    console.log(executorServerUrl);
    const subscribedChannelResource = config.sudoryApiDetail.channel_resource;
    await axios({
      method: 'get',
      url: `${executorServerUrl}`,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        if (res.data == true) clientTrueFalse = true;
        console.log(`Successful to run API to search Executor/Sudory client`);
      })
      .catch(error => {
        //console.log(error);
        throw new HttpException(500, `Sudory Server Error - ${JSON.stringify(error.response.data)} `);
      });

    //sudory namespace save...
    const resourceGroupSet = { resourceGroupSudoryNamespace: sudoryNamespace };
    await this.resourceGroup.update(resourceGroupSet, { where: { resourceGroupUuid: clusterUuid } });

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
          labels: {},
        },
      },
    ];

    // instant call
    const resultJo = await this.postExecuteService(
      'K8s interface for Job',
      'K8s interface for Job',
      clusterUuid,
      '00000000000000000000000000005002',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultJo) console.log(resultJo);
    const resultCj = await this.postExecuteService(
      'K8s interface for CronJob',
      'K8s interface for CronJob',
      clusterUuid,
      '00000000000000000000000000005003',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultCj) console.log(resultCj);
    const resultNd = await this.postExecuteService(
      'K8s interface for Node',
      'K8s interface for Node',
      clusterUuid,
      '00000000000000000000000000000010',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultNd) console.log(resultNd);
    const resultNS = await this.postExecuteService(
      'K8s interface for Namespace',
      'K8s interface for Namespace',
      clusterUuid,
      '00000000000000000000000000000004',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultNS) console.log(resultNS);
    const resultSV = await this.postExecuteService(
      'K8s interface for Service',
      'K8s interface for Service',
      clusterUuid,
      '00000000000000000000000000000020',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultSV) console.log(resultSV);
    const resultPD = await this.postExecuteService(
      'K8s interface for Pod',
      'K8s interface for Pod',
      clusterUuid,
      '00000000000000000000000000000002',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultPD) console.log(resultPD);
    const resultDP = await this.postExecuteService(
      'K8s interface for Deployment',
      'K8s interface for Deployment',
      clusterUuid,
      '00000000000000000000000000001002',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultDP) console.log(resultDP);
    const resultSS = await this.postExecuteService(
      'K8s interface for StatefulSet',
      'K8s interface for StatefulSet',
      clusterUuid,
      '00000000000000000000000000001004',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultSS) console.log(resultSS);
    const resultDS = await this.postExecuteService(
      'K8s interface for DaemonSet',
      'K8s interface for DaemonSet',
      clusterUuid,
      '00000000000000000000000000001006',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultDS) console.log(resultDS);
    const resultRS = await this.postExecuteService(
      'K8s interface for ReplicaSet',
      'K8s interface for ReplicaSet',
      clusterUuid,
      '00000000000000000000000000001008',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultRS) console.log(resultRS);
    const resultPC = await this.postExecuteService(
      'K8s interface for PVC',
      'K8s interface for PVC',
      clusterUuid,
      '00000000000000000000000000000018',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultPC) console.log(resultPC);
    const resultSE = await this.postExecuteService(
      'K8s interface for Secret',
      'K8s interface for Secret',
      clusterUuid,
      '00000000000000000000000000000014',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultSE) console.log(resultSE);
    const resultEP = await this.postExecuteService(
      'K8s interface for Endpoint',
      'K8s interface for Endpoint',
      clusterUuid,
      '00000000000000000000000000000016',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultEP) console.log(resultEP);
    const resultCM = await this.postExecuteService(
      'K8s interface for Configmap',
      'K8s interface for Configmap',
      clusterUuid,
      '00000000000000000000000000000006',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultCM) console.log(resultCM);
    const resultIG = await this.postExecuteService(
      'K8s interface for Ingress',
      'K8s interface for Ingress',
      clusterUuid,
      '00000000000000000000000000002002',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultIG) console.log(resultIG);
    const resultSC = await this.postExecuteService(
      'K8s interface for Storage Class',
      'K8s interface for Storage Class',
      clusterUuid,
      '00000000000000000000000000003002',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultSC) console.log(resultSC);
    const resultPV = await this.postExecuteService(
      'K8s interface for PV',
      'K8s interface for PV',
      clusterUuid,
      '00000000000000000000000000000012',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultPV) console.log(resultPV);
    const resultEV = await this.postExecuteService(
      'K8s interface for Event',
      'K8s interface for Event',
      clusterUuid,
      '00000000000000000000000000000008',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultEV) console.log(resultPV);

    // scheduleResource - job
    await this.scheduleResource(clusterUuid, customerAccountKey, 'JO', newCrontab1)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'JO', cronKey: res });
        console.log(`Submitted resource JO schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource JO schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - CronJob
    await this.scheduleResource(clusterUuid, customerAccountKey, 'CJ', newCrontab1)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'CJ', cronKey: res });
        console.log(`Submitted resource CJ schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource CJ schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - node
    await this.scheduleResource(clusterUuid, customerAccountKey, 'ND', newCrontab1)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'ND', cronKey: res });
        console.log(`Submitted resource ND schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource ND schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - namespace
    await this.scheduleResource(clusterUuid, customerAccountKey, 'NS', newCrontab2)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'NS', cronKey: res });
        console.log(`Submitted resource NS schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource NS schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - service
    await this.scheduleResource(clusterUuid, customerAccountKey, 'SV', newCrontab3)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'SV', cronKey: res });
        console.log(`Submitted resource SV schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource SV schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - Endpoint
    await this.scheduleResource(clusterUuid, customerAccountKey, 'EP', newCrontab4)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'EP', cronKey: res });
        console.log(`Submitted resource EP schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource EP schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - pod
    await this.scheduleResource(clusterUuid, customerAccountKey, 'PD', newCrontab5)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'PD', cronKey: res });
        console.log(`Submitted resource PD schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource PD schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - deployment
    await this.scheduleResource(clusterUuid, customerAccountKey, 'DP', newCrontab6)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'DP', cronKey: res });
        console.log(`Submitted resource DP schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource DP schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - daemonset
    await this.scheduleResource(clusterUuid, customerAccountKey, 'DS', newCrontab7)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'DS', cronKey: res });
        console.log(`Submitted resource DS schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource DS schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - replicaset
    await this.scheduleResource(clusterUuid, customerAccountKey, 'RS', newCrontab8)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'RS', cronKey: res });
        console.log(`Submitted resource RS schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource RS schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - statefulset
    //  await this.scheduleResource(clusterUuid, "SS"
    this.scheduleResource(clusterUuid, customerAccountKey, 'SS', newCrontab9)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'SS', cronKey: res });
        console.log(`Submitted resource SS schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource SS schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - pvc
    await this.scheduleResource(clusterUuid, customerAccountKey, 'PC', newCrontab10)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'PC', cronKey: res });
        console.log(`Submitted resource PC schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource PC schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - Secret
    await this.scheduleResource(clusterUuid, customerAccountKey, 'SE', newCrontab11)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'SE', cronKey: res });
        console.log(`Submitted resource SE schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource SE schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - Configmap
    await this.scheduleResource(clusterUuid, customerAccountKey, 'CM', newCrontab12)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'CM', cronKey: res });
        console.log(`Submitted resource CM schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource CM schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - PV
    await this.scheduleResource(clusterUuid, customerAccountKey, 'PV', newCrontab13)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'PV', cronKey: res });
        console.log(`Submitted resource PV schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource PV schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - Storage Class
    await this.scheduleResource(clusterUuid, customerAccountKey, 'SC', newCrontab14)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'SC', cronKey: res });
        console.log(`Submitted resource SC schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource SC schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - Ingress
    await this.scheduleResource(clusterUuid, customerAccountKey, 'IG', newCrontab15)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'IG', cronKey: res });
        console.log(`Submitted resource IG schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource IG schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    // scheduleResource - Event
    await this.scheduleResource(clusterUuid, customerAccountKey, 'EV', newCrontab15)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'EV', cronKey: res });
        console.log(`Submitted resource Event schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource Event schedule request for clsuter:${clusterUuid}`);
      }); //end of catch

    const responseExecutorClientCheck = { clusterUuid, clientTrueFalse };
    return responseExecutorClientCheck;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace
   */
  public async installKpsOnResourceGroup(
    clusterUuid: string,
    customerAccountKey: number,
    targetNamespace: string,
    systemId: string,
  ): Promise<object> {
    const serviceUuid = [];
    //const helmRepoUrl = config.helmRepoUrl;
    const prometheusUrlHead = config.obsUrl.prometheusUrlHead;
    const prometheusUrlTail = config.obsUrl.prometheusUrlTail;
    const grafanaUrlHead = config.obsUrl.grafanaUrlHead;
    const grafanaUrlTail = config.obsUrl.grafanaUrlTail;
    const alertManagerUrlHead = config.obsUrl.alertManagerUrlHead;
    const alertMangerUrlTail = config.obsUrl.alertManagerUrlTail;
    const lokiUrlHead = config.obsUrl.lokiUrlHead;
    const lokiUrlTail = config.obsUrl.lokiUrlTail;
    const webhookChannel = config.sudoryApiDetail.channel_webhook;

    const prometheus = prometheusUrlHead + targetNamespace + prometheusUrlTail;
    const grafana = grafanaUrlHead + targetNamespace + grafanaUrlTail;
    const alertManager = alertManagerUrlHead + targetNamespace + alertMangerUrlTail;
    const loki = lokiUrlHead + targetNamespace + lokiUrlTail;

    const resultKpsChart = await this.exporters.findAll({ where: { exporterType: 'HL' } });
    const chartLength = resultKpsChart.length;
    let kpsChartName = '';
    let kpsChartVersion = '';
    let kpsChartRepoUrl = '';
    let lokiChartName = '';
    let lokiChartVersion = '';
    let lokiChartRepoUrl = '';

    const resultResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!resultResourceGroup) throw new HttpException(404, `can't find cluster - clusterUuid: ${clusterUuid}`);
    const resourceGroupProvider = resultResourceGroup.resourceGroupProvider;

    for (let i = 0; i < chartLength; i++) {
      if (resultKpsChart[i].exporterHelmChartName === 'kube-prometheus-stack') {
        kpsChartName = resultKpsChart[i].exporterHelmChartName;
        kpsChartVersion = resultKpsChart[i].exporterHelmChartVersion;
        kpsChartRepoUrl = resultKpsChart[i].exporterHelmChartRepoUrl;
      }
      if (resultKpsChart[i].exporterHelmChartName === 'loki-stack') {
        lokiChartName = resultKpsChart[i].exporterHelmChartName;
        lokiChartVersion = resultKpsChart[i].exporterHelmChartVersion;
        lokiChartRepoUrl = resultKpsChart[i].exporterHelmChartRepoUrl;
      }
    }
    const customerAccountId = await this.customerAccountService.getCustomerAccountIdByKey(customerAccountKey);
    const kpsSteps = [
      {
        args: {
          name: 'kps',
          chart_name: kpsChartName,
          repo_url: kpsChartRepoUrl,
          namespace: targetNamespace,
          chart_version: kpsChartVersion,
          values: {
            prometheus: {
              extraSecret: {
                name: 'vmmulti',
                data: {
                  username: 'I' + customerAccountId,
                  password: customerAccountId,
                },
              },
              prometheusSpec: {
                externalLabels: {
                  clusterUuid: clusterUuid,
                },
                remoteWrite: [
                  {
                    url: config.victoriaMetrics.vmMultiAuthUrl + '/api/v1/write',
                    basicAuth: {
                      username: {
                        name: 'vmmulti',
                        key: 'username',
                      },
                      password: {
                        name: 'vmmulti',
                        key: 'password',
                      },
                    },
                  },
                ],
              },
            },
            'prometheus-node-exporter': {
              hostRootFsMount: {
                enabled: {},
              },
            },
          },
        },
      },
    ];

    if (resourceGroupProvider == 'DD') {
      kpsSteps[0].args.values['prometheus-node-exporter'].hostRootFsMount.enabled = false;
    }

    const kpsExecuteName = 'KPS Helm Instllation';
    const kpsExecuteSummary = 'KPS Helm Installation';
    const kpsTemplateUuid = '20000000000000000000000000000001';
    const executeKpsHelm = this.postExecuteService(
      kpsExecuteName,
      kpsExecuteSummary,
      clusterUuid,
      kpsTemplateUuid,
      kpsSteps,
      customerAccountKey,
      webhookChannel,
    );

    if (!executeKpsHelm) throw new HttpException(500, `Error on installing kps chart ${clusterUuid}`);

    const lokiSteps = [
      {
        args: {
          name: 'loki',
          chart_name: lokiChartName,
          repo_url: lokiChartRepoUrl,
          namespace: targetNamespace,
          chart_version: lokiChartVersion,
          values: {},
        },
      },
    ];

    const lokiExecuteName = 'Loki-Promtail Helm Instllation';
    const lokiExecuteSummary = 'Loki-Promtail Helm Installation';
    const lokiTemplateUuid = '20000000000000000000000000000001';
    const executeLokiHelm = this.postExecuteService(
      lokiExecuteName,
      lokiExecuteSummary,
      clusterUuid,
      lokiTemplateUuid,
      lokiSteps,
      customerAccountKey,
      webhookChannel,
    );
    console.log('########### Loki chart installation');
    console.log(executeLokiHelm);

    // update ResourceGroup - resourceGroupPrometheus
    const resourceGroup = {
      resourceGroupPrometheus: prometheus,
      resourceGroupGrafana: grafana,
      resourceGroupAlertManager: alertManager,
      resourceGroupLoki: loki,
      resourceGroupKpsLokiNamespace: targetNamespace,
    };
    // get system user id

    try {
      const ResponseResoureGroup: IResourceGroup = await this.resourceGroupService.updateResourceGroupByUuid(clusterUuid, resourceGroup, systemId);
      console.log('Success to create ResponseGroup: ', ResponseResoureGroup.resourceGroupId);
    } catch (error) {
      console.log(error);
      throw new HttpException(500, `Error on creating cluster ${clusterUuid}`);
    }

    //schedule metricMeta
    await this.scheduleMetricMeta(clusterUuid, customerAccountKey)
      .then(async (res: any) => {
        console.log(`Submitted metric meta feeds schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule MetricMeta ');
      }); //end of catch

    //schedule alert rules & received
    await this.scheduleAlert(clusterUuid, customerAccountKey)
      .then(async (res: any) => {
        console.log(`Submitted alert feeds schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule alert feeds ');
      }); //end of catch

    //schdule SyncResource
    const cronTabforResource = config.resourceCron;
    await this.scheduleSyncResources(clusterUuid, cronTabforResource)
      .then(async (res: any) => {
        console.log(`Submitted resource sync schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule resource sync');
      }); //end of catch

    //schdule SyncAlerts
    const cronTabforAlert = config.alertCron;
    await this.scheduleSyncAlerts(clusterUuid, cronTabforAlert)
      .then(async (res: any) => {
        console.log(`Submitted Alert sync schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule alert sync');
      }); //end of catch

    //schdule SyncMetricMeta
    const cronTabforMetricMeta = config.metricCron;
    await this.scheduleSyncMetricMeta(clusterUuid, cronTabforMetricMeta)
      .then(async (res: any) => {
        console.log(`Submitted MetricMeta sync schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule metric meta sync');
      }); //end of catch

    if (config.metricReceivedSwitch === 'on') {
      //schdule SyncMetricReceived
      const cronTabforMetricReceived = config.metricReceivedCron;
      await this.scheduleSyncMetricReceived(clusterUuid, cronTabforMetricReceived)
        .then(async (res: any) => {
          console.log(`Submitted metric-received sync schedule reqeust on ${clusterUuid} cluster successfully`);
        })
        .catch(error => {
          console.log(error);
          throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule metric-received sync');
        }); //end of catch
    }
    return serviceUuid;
  }

  /**
   * @param {string} clusterUuid
   * @param {number} customerAccountKey
   * @param {string} sudoryNamespace
   */
  public async checkExecutorClientForOpenstack(clusterUuid: string, sudoryNamespace: string, customerAccountKey: number): Promise<object> {
    let clientTrueFalse = false;
    const resourceJobKey = [];
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession + '/cluster/' + clusterUuid + '/alive';

    const resourceCron = config.resourceCron;
    //const sessionQueryParameter = `?q=(eq%20cluster_uuid%20"${clusterUuid}")`;
    //executorServerUrl = executorServerUrl + sessionQueryParameter;
    const subscribedChannelResource = config.sudoryApiDetail.channel_resource;
    await axios({
      method: 'get',
      url: `${executorServerUrl}`,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        if (res.data == true) clientTrueFalse = true;
        console.log(`Successful to run API to search Executor/Sudory client`);
      })
      .catch(error => {
        //console.log(error);
        throw new HttpException(500, `Sudory Server Error - ${JSON.stringify(error.response.data)} `);
      });

    //sudory namespace save...
    const resourceGroupSet = { resourceGroupSudoryNamespace: sudoryNamespace };
    await this.resourceGroup.update(resourceGroupSet, { where: { resourceGroupUuid: clusterUuid } });

    const steps = [];


    // // instant call
    // const resultHV = await this.postExecuteService(
    //   'openstack interface for HVList',
    //   'openstack interface for HVList',
    //   clusterUuid,
    //   '', // TODO: insert template_uuid
    //   steps,
    //   customerAccountKey,
    //   subscribedChannelResource,
    // );
    // if (!resultHV) console.log(resultHV);

    // post Auth execute
    // const resultAuth = await this.postExecuteService(
    //   'openstack interface for authentication',
    //   'openstack interface for authentication',
    //   clusterUuid,
    //   '',
    //   steps,
    //   customerAccountKey,
    //   "",
    // );
    // if (!resultAuth) console.log(resultAuth);

    // post PM Excute
    let uploadPMQuery: any = {}
    let metricQuery: any[] = []
    metricQuery[0].name = "pm_info"
    metricQuery[0].type = "OS_CLUSTER_PM_INFO"
    metricQuery[0].resourceGroupUuid = clusterUuid

    uploadPMQuery.query = metricQuery
    const resultPM = await this.metricService.uploadResourcePM(customerAccountKey, uploadPMQuery)
    if (!resultPM) {console.log(resultPM)}

    const resultPJ = await this.postExecuteService(
      'openstack interface for PJList',
      'openstack interface for PJList',
      clusterUuid,
      '50000000000000000000000000000002',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultPJ) console.log(resultPJ);

    const resultVM = await this.postExecuteService(
      'openstack interface for VMList',
      'openstack interface for VMList',
      clusterUuid,
      '50000000000000000000000000000003',
      steps,
      customerAccountKey,
      subscribedChannelResource,
    );
    if (!resultVM) console.log(resultVM);

// scheduleResource - PM
    await this.scheduleResource(clusterUuid, customerAccountKey, 'PM', resourceCron)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'PM', cronKey: res });
        console.log(`Submitted resource PM schedule request on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource PM schedule request for cluster:${clusterUuid}`);
      });

// // scheduleResource - HV
//     await this.scheduleResource(clusterUuid, customerAccountKey, 'HV', resourceCron)
//       .then(async (res: any) => {
//         resourceJobKey.push({ resourceType: 'HV', cronKey: res });
//         console.log(`Submitted resource Hypervisor schedule request on ${clusterUuid} cluster successfully`);
//       })
//       .catch(error => {
//         console.log(error);
//         console.log(`confirmed the executor/sudory client installed but fail to submit resource HV schedule request for cluster:${clusterUuid}`);
//       }); //end of catch

// // scheduleResource - ReAuth
//     await this.scheduleResource(clusterUuid, customerAccountKey, 'PJ', resourceCron)
//       .then(async (res: any) => {
//         resourceJobKey.push({ resourceType: 'PJ', cronKey: res });
//         console.log(`Submitted resource Project schedule request on ${clusterUuid} cluster successfully`);
//       })
//       .catch(error => {
//         console.log(error);
//         console.log(`confirmed the executor/sudory client installed but fail to submit resource PJ schedule request for cluster:${clusterUuid}`);
//       });

// scheduleResource - PJ
    await this.scheduleResource(clusterUuid, customerAccountKey, 'PJ', resourceCron)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'PJ', cronKey: res });
        console.log(`Submitted resource Project schedule request on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource PJ schedule request for cluster:${clusterUuid}`);
      });

// scheduleResource - VM
    await this.scheduleResource(clusterUuid, customerAccountKey, 'VM', resourceCron)
      .then(async (res: any) => {
        resourceJobKey.push({ resourceType: 'VM', cronKey: res });
        console.log(`Submitted resource virtualMachine schedule request on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        console.log(`confirmed the executor/sudory client installed but fail to submit resource VM schedule request for cluster:${clusterUuid}`);
      });

    const responseExecutorClientCheck = { clusterUuid, clientTrueFalse };
    return responseExecutorClientCheck;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace
   */
  public async installKpsOnResourceGroupForOpenstack(
    clusterUuid: string,
    customerAccountKey: number,
    targetNamespace: string,
    systemId: string,
  ): Promise<object> {
    const serviceUuid = [];
    //const helmRepoUrl = config.helmRepoUrl;
    const prometheusUrlHead = config.obsUrl.prometheusUrlHead;
    const prometheusUrlTail = config.obsUrl.prometheusUrlTail;
    const grafanaUrlHead = config.obsUrl.grafanaUrlHead;
    const grafanaUrlTail = config.obsUrl.grafanaUrlTail;
    const alertManagerUrlHead = config.obsUrl.alertManagerUrlHead;
    const alertMangerUrlTail = config.obsUrl.alertManagerUrlTail;
    const webhookChannel = config.sudoryApiDetail.channel_webhook;

    const prometheus = prometheusUrlHead + targetNamespace + prometheusUrlTail;
    const grafana = grafanaUrlHead + targetNamespace + grafanaUrlTail;
    const alertManager = alertManagerUrlHead + targetNamespace + alertMangerUrlTail;

    const resultKpsChart = await this.exporters.findAll({ where: { exporterType: 'HL' } });
    const chartLength = resultKpsChart.length;
    let kpsChartName = '';
    let kpsChartVersion = '';
    let kpsChartRepoUrl = '';

    const resultResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!resultResourceGroup) throw new HttpException(404, `can't find cluster - clusterUuid: ${clusterUuid}`);
    const resourceGroupProvider = resultResourceGroup.resourceGroupProvider;

    for (let i = 0; i < chartLength; i++) {
      if (resultKpsChart[i].exporterHelmChartName === 'kube-prometheus-stack') {
        kpsChartName = resultKpsChart[i].exporterHelmChartName;
        kpsChartVersion = resultKpsChart[i].exporterHelmChartVersion;
        kpsChartRepoUrl = resultKpsChart[i].exporterHelmChartRepoUrl;
      }
    }
    const customerAccountId = await this.customerAccountService.getCustomerAccountIdByKey(customerAccountKey);
    const kpsSteps = [
      {
        args: {
          name: 'kps',
          chart_name: kpsChartName,
          repo_url: kpsChartRepoUrl,
          namespace: targetNamespace,
          chart_version: kpsChartVersion,
          values: {
            prometheus: {
              extraSecret: {
                name: 'vmmulti',
                data: {
                  username: 'I' + customerAccountId,
                  password: customerAccountId,
                },
              },
              prometheusSpec: {
                externalLabels: {
                  clusterUuid: clusterUuid,
                },
                remoteWrite: [
                  {
                    url: config.victoriaMetrics.vmMultiAuthUrl + '/api/v1/write',
                    basicAuth: {
                      username: {
                        name: 'vmmulti',
                        key: 'username',
                      },
                      password: {
                        name: 'vmmulti',
                        key: 'password',
                      },
                    },
                  },
                ],
              },
            },
            'prometheus-node-exporter': {
              hostRootFsMount: {
                enabled: {},
              },
            },
          },
        },
      },
    ];

    if (resourceGroupProvider == 'DD') {
      kpsSteps[0].args.values['prometheus-node-exporter'].hostRootFsMount.enabled = false;
    }

    const kpsExecuteName = 'KPS Helm Installation';
    const kpsExecuteSummary = 'KPS Helm Installation';
    const kpsTemplateUuid = '20000000000000000000000000000001';
    const executeKpsHelm = this.postExecuteService(
      kpsExecuteName,
      kpsExecuteSummary,
      clusterUuid,
      kpsTemplateUuid,
      kpsSteps,
      customerAccountKey,
      webhookChannel,
    );

    if (!executeKpsHelm) throw new HttpException(500, `Error on installing kps chart ${clusterUuid}`);

    // update ResourceGroup - resourceGroupPrometheus
    const resourceGroup = {
      resourceGroupPrometheus: prometheus,
      resourceGroupGrafana: grafana,
      resourceGroupAlertManager: alertManager,
      resourceGroupKpsLokiNamespace: targetNamespace,
    };
    // get system user id

    try {
      const ResponseResoureGroup: IResourceGroup = await this.resourceGroupService.updateResourceGroupByUuid(clusterUuid, resourceGroup, systemId);
      console.log('Success to create ResponseGroup: ', ResponseResoureGroup.resourceGroupId);
    } catch (error) {
      console.log(error);
      throw new HttpException(500, `Error on creating cluster ${clusterUuid}`);
    }

    //schedule metricMeta
    await this.scheduleMetricMeta(clusterUuid, customerAccountKey)
      .then(async (res: any) => {
        console.log(`Submitted metric meta feeds schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule MetricMeta ');
      }); //end of catch

    //schedule alert rules & received
    await this.scheduleAlert(clusterUuid, customerAccountKey)
      .then(async (res: any) => {
        console.log(`Submitted alert feeds schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule alert feeds ');
      }); //end of catch

    //schdule SyncResource
    const cronTabforResource = config.resourceCron;
    await this.scheduleSyncResources(clusterUuid, cronTabforResource)
      .then(async (res: any) => {
        console.log(`Submitted resource sync schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule resource sync');
      }); //end of catch

    //schdule SyncAlerts
    const cronTabforAlert = config.alertCron;
    await this.scheduleSyncAlerts(clusterUuid, cronTabforAlert)
      .then(async (res: any) => {
        console.log(`Submitted Alert sync schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule alert sync');
      }); //end of catch

    //schdule SyncMetricMeta
    const cronTabforMetricMeta = config.metricCron;
    await this.scheduleSyncMetricMeta(clusterUuid, cronTabforMetricMeta)
      .then(async (res: any) => {
        console.log(`Submitted MetricMeta sync schedule reqeust on ${clusterUuid} cluster successfully`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule metric meta sync');
      }); //end of catch

    if (config.metricReceivedSwitch === 'on') {
      //schdule SyncMetricReceived
      const cronTabforMetricReceived = config.metricReceivedCron;
      await this.scheduleSyncMetricReceived(clusterUuid, cronTabforMetricReceived)
        .then(async (res: any) => {
          console.log(`Submitted metric-received sync schedule reqeust on ${clusterUuid} cluster successfully`);
        })
        .catch(error => {
          console.log(error);
          throw new HttpException(500, 'Submitted kps chart installation request but fail to schedule metric-received sync');
        }); //end of catch
    }
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
  public async postExecuteService(
    name: string,
    summary: string,
    clusterUuid: string,
    templateUuid: string,
    steps: Object,
    customerAccountKey: number,
    subscribed_channel: string,
  ): Promise<object> {
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const sudoryBaseUrl = config.sudoryApiDetail.baseURL;
    const sudoryPathService = config.sudoryApiDetail.pathService;
    const sudoryUrl = sudoryBaseUrl + sudoryPathService;
    const sudoryChannel = subscribed_channel;
    const uuid = require('uuid');
    const executorServiceId = uuid.v1();

    const sudoryServiceData = {
      cluster_uuid: clusterUuid,
      name: name,
      template_uuid: templateUuid,
      steps: steps,
      summary: summary,
      on_completion: on_completion,
      subscribed_channel: sudoryChannel,
    };
    console.log(sudoryServiceData);
    const serviceData = await axios({
      method: 'POST',
      url: sudoryUrl,
      data: sudoryServiceData,
    })
      .then(async (res: any) => {
        const serviceUuid = res.data.uuid;
        console.log(`Submit sudory reqeust on ${clusterUuid} cluster successfully, serviceUuid is ${serviceUuid}`);
        return res.data;
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Not able to execute service');
      });

    const insertData = {
      executorServiceId: executorServiceId,
      customerAccountKey: customerAccountKey,
      name: name,
      summary: summary,
      createdAt: new Date(),
      createdBy: 'SYSTEM',
      serviceUuid: serviceData.uuid,
      clusterUuid: serviceData.cluster_uuid,
      templateUuid: templateUuid,
      onCompletion: on_completion,
      steps: JSON.parse(JSON.stringify(steps)),
      subscribed_channel: sudoryChannel,
    };
    console.log('Executor Data for DB insert: ');
    console.log(insertData);

    const resultExecutorService = await this.executorService.create(insertData);
    //console.log(resultExecutorService);
    return resultExecutorService;
  }

  /**
   * @param {ExecutorResourceDto} resourceInputData
   */
  public async requestResourceToExecutor(resourceInputData: ExecutorResourceListDto): Promise<string> {
    let serviceUuid = '';
    let template_uuid = '';
    let service_name = '';
    let service_summary = '';
    let argsData;

    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;

    const resourceType = resourceInputData.resourceType;
    const clusterUuid = resourceInputData.clusterUuid;
    const targetNamespace = resourceInputData.targetNamespace;
    const name = resourceInputData.name;
    const labels = resourceInputData.labels;

    //sudory template uuid
    const templateService = '00000000000000000000000000000020';
    const templateNode = '00000000000000000000000000000010';
    const templateNamespace = '00000000000000000000000000000004';
    const templatePod = '00000000000000000000000000000002';
    const templateDeployment = '00000000000000000000000000001002';
    const templateStatefulset = '00000000000000000000000000001004';
    const templateDaemonset = '00000000000000000000000000001006';
    const templateReplicaset = '00000000000000000000000000001008';
    const templatePvc = '00000000000000000000000000000018';
    const templateSecret = '00000000000000000000000000000014';
    const templateEndpoint = '00000000000000000000000000000016';
    const templateConfigmap = '00000000000000000000000000000006';
    const templateIngress = '00000000000000000000000000002002';
    const templatePv = '00000000000000000000000000000012';
    const templateStorageClass = '00000000000000000000000000003002';
    const templateEvent = '00000000000000000000000000000008';
    const templateJob = '00000000000000000000000000005002';
    const templateCronJob = '00000000000000000000000000005003';

    switch (resourceType) {
      case 'SV': //service
        service_name = 'k8s service list request';
        service_summary = 'k8s service list request';
        template_uuid = templateService;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'ND': //node
        service_name = 'k8s node list request';
        service_summary = 'k8s node list request';
        template_uuid = templateNode;
        if (!labels) {
          argsData = { labels: {} };
        } else {
          argsData = { labels: labels };
        }

        break;

      case 'NS': //namespace
        service_name = 'k8s namespace list request';
        service_summary = 'k8s namespace list request';
        template_uuid = templateNamespace;
        if (!labels) {
          argsData = { labels: {} };
        } else {
          argsData = { labels: labels };
        }

        break;

      case 'PD': //pod
        service_name = 'k8s pod list request';
        service_summary = 'k8s pod list request';
        template_uuid = templatePod;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'DP': //deployment
        service_name = 'k8s deployment list request';
        service_summary = 'k8s deployment list request';
        template_uuid = templateDeployment;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'SS': //statefulset
        service_name = 'k8s statefulset list request';
        service_summary = 'k8s statefulset list request';
        template_uuid = templateStatefulset;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'DS': //daemonset
        service_name = 'k8s daemonset list request';
        service_summary = 'k8s daemonset list request';
        template_uuid = templateDaemonset;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'RS': //replicaset
        service_name = 'k8s replicaset list request';
        service_summary = 'k8s replicaset list request';
        template_uuid = templateReplicaset;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'PC': //pvc
        service_name = 'k8s pvc list request';
        service_summary = 'k8s pvc list request';
        template_uuid = templatePvc;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'SE': //secret
        service_name = 'k8s secret list request';
        service_summary = 'k8s secret list request';
        template_uuid = templateSecret;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'EP': //endpoint
        service_name = 'k8s endpoint list request';
        service_summary = 'k8s endpoint list request';
        template_uuid = templateEndpoint;

        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'CM': //configmap
        service_name = 'k8s configmap list request';
        service_summary = 'k8s configmap list request';
        template_uuid = templateConfigmap;
        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'IG': //ingress
        service_name = 'k8s ingress list request';
        service_summary = 'k8s ingress list request';
        template_uuid = templateIngress;
        if (!targetNamespace) {
          if (!labels) {
            argsData = { namespace: '', labels: {} };
          } else {
            argsData = { namespace: '', labels: labels };
          }
        } else {
          if (!labels) {
            argsData = { namespace: targetNamespace, labels: {} };
          } else {
            argsData = { namespace: targetNamespace, labels: labels };
          }
        }

        break;

      case 'PV': //pv
        service_name = 'k8s pv list request';
        service_summary = 'k8s pv list request';
        template_uuid = templatePv;
        if (!labels) {
          argsData = { labels: {} };
        } else {
          argsData = { labels: labels };
        }

        break;

      case 'SC': //sc
        service_name = 'k8s storage class list request';
        service_summary = 'k8s storage class list request';
        template_uuid = templateStorageClass;
        if (!labels) {
          argsData = { labels: {} };
        } else {
          argsData = { labels: labels };
        }

        break;

      case 'EV': //event
        service_name = 'k8s event list request';
        service_summary = 'k8s event list request';
        template_uuid = templateEvent;
        if (!labels) {
          argsData = { labels: {} };
        } else {
          argsData = { labels: labels };
        }

        break;

      case 'JO': //job
        service_name = 'k8s job list request';
        service_summary = 'k8s job list request';
        template_uuid = templateJob;
        if (!labels) {
          argsData = { labels: {} };
        } else {
          argsData = { labels: labels };
        }

        break;

      case 'CJ': //cron-job
        service_name = 'k8s cronjob list request';
        service_summary = 'k8s cronjob list request';
        template_uuid = templateCronJob;
        if (!labels) {
          argsData = { labels: {} };
        } else {
          argsData = { labels: labels };
        }

        break;
      default:
    }

    const sudoryServiceData = {
      cluster_uuid: clusterUuid,
      name: service_name,
      template_uuid: template_uuid,
      summary: service_summary,
      subscribe_channel: '',
      steps: [],
    };
    console.log(argsData);
    argsData = { args: argsData };
    sudoryServiceData.steps.push(argsData);
    console.log(sudoryServiceData);
    await axios({
      method: 'POST',
      url: `${executorServerUrl}`,
      data: sudoryServiceData,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        console.log(res);
        serviceUuid = res.data.uuid;
        console.log(`Submit ${service_name} on ${clusterUuid} cluster successfully, serviceUuid is ${serviceUuid}`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Unknown error to install kps chart');
      });

    return serviceUuid;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace
   */

  public async scheduleMetricMeta(clusterUuid: string, customerAccountKey: number): Promise<object> {
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
    //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090";
    const subscribe_channel = config.sudoryApiDetail.channel_metric;
    //get customerAccountId
    const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);
    if (!customerAccountData) {
      throw new HttpException(404, `customerAccountKey ${customerAccountKey} not found`);
    }

    const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!responseResourceGroup) {
      throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);
    }
    const prometheus = responseResourceGroup.resourceGroupPrometheus;

    const cronData = {
      name: 'Get MetricMeta',
      summary: 'Get MetricMeta',
      cronTab: '*/5 * * * *',
      clusterId: clusterUuid,
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      accountId: customerAccountData.customerAccountId,
      apiUrl: executorServerUrl,
      apiType: 'POST',
      apiBody: {
        cluster_uuid: clusterUuid,
        name: 'Get MetricMeta',
        template_uuid: '10000000000000000000000000000007',
        summary: 'Get MetricMeta',
        subscribed_channel: subscribe_channel,
        on_completion: on_completion,
        steps: [
          {
            args: {
              url: prometheus,
              match_target: '',
              metric: '',
              limit: '',
            },
          },
        ],
      },
    };

    const resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId);
    const cronJobKey = { key: resultNewCron.scheduleKey, jobname: 'Get MetricMeta', type: 'add' };

    return cronJobKey;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} targetNamespace
   */

  public async scheduleAlert(clusterUuid: string, customerAccountKey: number): Promise<object> {
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
    const subscribed_channel = config.sudoryApiDetail.channel_alert;

    //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090";
    //get customerAccountId
    const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);
    if (!customerAccountData) {
      throw new HttpException(404, `customerAccountKey ${customerAccountKey} not found`);
    }

    const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!responseResourceGroup) {
      throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);
    }
    const prometheus = responseResourceGroup.resourceGroupPrometheus;

    const cronData = {
      name: 'Get Alert Rules & Alert Received',
      summary: 'Get Alert Rules & Alert Received',
      cronTab: '* * * * *',
      apiUrl: executorServerUrl,
      apiType: 'POST',
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: clusterUuid,
      accountId: customerAccountData.customerAccountId,
      apiBody: {
        cluster_uuid: clusterUuid,
        name: 'Get Alert Rules & Alert Received',
        template_uuid: '10000000000000000000000000000004',
        summary: 'Get Alert Rules & Alert Received',
        subscribed_channel: subscribed_channel,
        on_completion: on_completion,
        steps: [
          {
            args: {
              url: prometheus,
            },
          },
        ],
      },
    };

    const resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId);
    const cronJobKey = { key: resultNewCron.scheduleKey, jobname: 'Get Alert Rules & Alert Received', type: 'add' };

    return cronJobKey;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} resourceType
   */
  public async scheduleResource(clusterUuid: string, customerAccountKey: number, resourceType: string, newCrontab: string): Promise<object> {
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    let executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
    const subscribed_channel = config.sudoryApiDetail.channel_resource;

    //get customerAccountId
    const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);
    if (!customerAccountData) {
      throw new HttpException(404, `customerAccountKey ${customerAccountKey} not found`);
    }

    //sudory template uuid
    const resource_template = [
      { resourceName: 'Service', resourceType: 'SV', template_uuid: '00000000000000000000000000000020' }, //service
      { resourceName: 'Node', resourceType: 'ND', template_uuid: '00000000000000000000000000000010' }, // node
      { resourceName: 'Namespace', resourceType: 'NS', template_uuid: '00000000000000000000000000000004' }, //namespace
      { resourceName: 'Pod', resourceType: 'PD', template_uuid: '00000000000000000000000000000002' }, //pod
      { resourceName: 'Deployment', resourceType: 'DP', template_uuid: '00000000000000000000000000001002' }, //deployment
      { resourceName: 'Statefulset', resourceType: 'SS', template_uuid: '00000000000000000000000000001004' }, //statefulset
      { resourceName: 'Daemonset', resourceType: 'DS', template_uuid: '00000000000000000000000000001006' }, //daemonset
      { resourceName: 'Replicaset', resourceType: 'RS', template_uuid: '00000000000000000000000000001008' }, //replicaset
      { resourceName: 'PVC', resourceType: 'PC', template_uuid: '00000000000000000000000000000018' }, //pvc
      { resourceName: 'Secret', resourceType: 'SE', template_uuid: '00000000000000000000000000000014' }, //secret
      { resourceName: 'Endpoint', resourceType: 'EP', template_uuid: '00000000000000000000000000000016' }, //endpoint
      { resourceName: 'Configmap', resourceType: 'CM', template_uuid: '00000000000000000000000000000006' }, //configmap
      { resourceName: 'Ingress', resourceType: 'IG', template_uuid: '00000000000000000000000000002002' }, //ingress
      { resourceName: 'PV', resourceType: 'PV', template_uuid: '00000000000000000000000000000012' }, //pv
      { resourceName: 'Storage Class', resourceType: 'SC', template_uuid: '00000000000000000000000000003002' }, //storageclass
      { resourceName: 'Event', resourceType: 'EV', template_uuid: '00000000000000000000000000000008' }, //storageclass
      { resourceName: 'Job', resourceType: 'JO', template_uuid: '00000000000000000000000000005002' }, //job
      { resourceName: 'CronJob', resourceType: 'CJ', template_uuid: '00000000000000000000000000005003' }, //cron-job
      { resourceName: 'PhysicalMachine', resourceType: 'PM'}, //pm
      { resourceName: 'Project', resourceType: 'PJ', template_uuid: '50000000000000000000000000000002' }, //project
      { resourceName: 'VM', resourceType: 'VM', template_uuid: '50000000000000000000000000000004' }, //vm
      // { resourceName: 'Network', resourceType: 'NT', template_uuid: '50000000000000000000000000000006' }, //vm
      // { resourceName: 'Router', resourceType: 'RT', template_uuid: '50000000000000000000000000000008' }, //vm
      // { resourceName: 'Subnet', resourceType: 'SN', template_uuid: '50000000000000000000000000000010' }, //vm
    ];

    const selectedTemplate = resource_template.find(template => {
      return template.resourceType === resourceType;
    });

    if (!selectedTemplate) {
      throw new HttpException(404, 'not supported resourceType');
    }

    const steps = [];
    let apiBody: {};

    const template_uuid = selectedTemplate.template_uuid;
    let scheduleName = 'K8s interface for ' + selectedTemplate.resourceName;
    let scheduleSummary = 'K8s interface for ' + selectedTemplate.resourceName;

    apiBody = {
      cluster_uuid: clusterUuid,
      name: scheduleName,
      template_uuid: template_uuid,
      summary: scheduleSummary,
      subscribed_channel: subscribed_channel,
      on_completion: on_completion,
      steps: steps,
    }

    switch (selectedTemplate.resourceType) {
    case "PM":
      scheduleName = 'OS interface for ' + selectedTemplate.resourceName;
      executorServerUrl = config.appUrl + ':' + config.appPort + '/metric/upload/pm'
      apiBody = {
        cluster_uuid: clusterUuid,
        customerAccountKey: customerAccountKey,
        query: "",
        //TODO check required params for get PM metric
      }
      break
    case "VM":
      scheduleName = 'OS interface for ' + selectedTemplate.resourceName;
      scheduleSummary = 'OS interface for ' + selectedTemplate.resourceName;
      steps.push({args: {detail: true}})
      break
    default:
      scheduleName = 'K8S interface for ' + selectedTemplate.resourceName;
      scheduleSummary = 'K8S interface for ' + selectedTemplate.resourceName;
    }

    const cronData = {
      name: scheduleName,
      summary: scheduleSummary,
      cronTab: newCrontab,
      apiUrl: executorServerUrl,
      apiType: 'POST',
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: clusterUuid,
      //accountId: customerAccountData.customerAccountId,
      apiBody: apiBody,
    };
    const resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId);

    const cronJobKey = { key: resultNewCron.scheduleKey, jobname: scheduleName, type: 'add' };

    return cronJobKey;
  }

  /**
   * @param {string} clusterUuid
   */
  public async scheduleMetricReceived(clusterUuid: string, customerAccountKey: number): Promise<object> {
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
    const subscribed_channel = config.sudoryApiDetail.channel_metric_received;
    //const prometheus = "http://kps-kube-prometheus-stack-prometheus." + targetNamespace + ".svc.cluster.local:9090";
    let cronData;
    const cronJobKey = [];

    //get customerAccountId
    const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);
    if (!customerAccountData) {
      throw new HttpException(404, `customerAccountKey ${customerAccountKey} not found`);
    }

    const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!responseResourceGroup) {
      throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);
    }
    const prometheus = responseResourceGroup.resourceGroupPrometheus;

    // get distinct data of job...
    const DistinctJobList = await this.MetricMetaService.getDistinctJobOfMetricMetabyUuid(clusterUuid);
    if (!DistinctJobList) {
      throw new HttpException(404, `No metric Job information with the clusterUuid: ${clusterUuid}`);
    }

    // loop to schedule MetricReceived by
    for (let i = 0; i < DistinctJobList.length; i++) {
      const targetJob = DistinctJobList[i].metricMetaTargetJob;
      const matricQuery = `{job="` + targetJob + `"}`;
      const matricName = 'MetricReceived-' + targetJob;
      const matricSummary = targetJob;

      cronData = {
        name: matricName,
        summary: matricSummary,
        cronTab: '*/5 * * * *',
        apiUrl: executorServerUrl,
        clusterId: clusterUuid,
        //accountId: customerAccountData.customerAccountId,
        reRunRequire: true,
        scheduleFrom: '',
        scheduleTo: '',
        apiBody: {
          cluster_uuid: clusterUuid,
          name: matricName,
          template_uuid: '10000000000000000000000000000001',
          summary: matricSummary,
          subscribed_channel: subscribed_channel,
          on_completion: on_completion,
          steps: [
            {
              args: {
                url: prometheus,
                query: matricQuery,
              },
            },
          ],
        },
      };

      const resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId);
      cronJobKey[i] = { key: resultNewCron.scheduleKey, jobname: targetJob, type: 'add' };
    } // end of for loop
    return cronJobKey;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} cronTab
   */
  public async scheduleSyncMetricReceived(clusterUuid: string, cronTab: string): Promise<object> {
    const nexclipperApiUrl = config.appUrl + ':' + config.appPort + '/executor/syncMetricReceived';
    const cronData = {
      name: 'SyncMetricReceived',
      summary: 'SyncMetricReceived',
      cronTab: cronTab,
      apiType: 'POST',
      apiUrl: nexclipperApiUrl,
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: clusterUuid,
      //        //accountId: getCustomerAccount.customerAccountId,
      apiBody: {
        clusterUuid: clusterUuid,
      },
    };
    const getResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    const getCustomerAccount = await this.customerAccountService.getCustomerAccountByKey(getResourceGroup.customerAccountKey);
    const resultSchedule = await this.schedulerService.createScheduler(cronData, getCustomerAccount.customerAccountId);
    console.log(resultSchedule);
    return resultSchedule;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} cronTab
   */
  public async scheduleSyncResources(clusterUuid: string, cronTab: string): Promise<object> {
    const nexclipperApiUrl = config.appUrl + ':' + config.appPort + '/executor/syncResources';
    const cronData = {
      name: 'SyncResources',
      summary: 'SyncResources',
      cronTab: `*/5 * * * *`,
      apiType: 'POST',
      apiUrl: nexclipperApiUrl,
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: clusterUuid,
      apiBody: {
        clusterUuid: clusterUuid,
        cronTab: cronTab,
      },
    };
    const getResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    const getCustomerAccount = await this.customerAccountService.getCustomerAccountByKey(getResourceGroup.customerAccountKey);
    const resultSchedule = await this.schedulerService.createScheduler(cronData, getCustomerAccount.customerAccountId);
    console.log(resultSchedule);
    return resultSchedule;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} cronTab
   */
  public async scheduleSyncAlerts(clusterUuid: string, cronTab: string): Promise<object> {
    const nexclipperApiUrl = config.appUrl + ':' + config.appPort + '/executor/syncAlerts';
    const cronData = {
      name: 'SyncAlerts',
      summary: 'SyncAlerts',
      cronTab: '*/5 * * * *',
      apiUrl: nexclipperApiUrl,
      apiType: 'POST',
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: clusterUuid,
      apiBody: {
        clusterUuid: clusterUuid,
        cronTab: cronTab,
      },
    };
    const getResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    const getCustomerAccount = await this.customerAccountService.getCustomerAccountByKey(getResourceGroup.customerAccountKey);
    const resultSchedule = await this.schedulerService.createScheduler(cronData, getCustomerAccount.customerAccountId);
    console.log(resultSchedule);
    return resultSchedule;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} cronTab
   */
  public async scheduleSyncMetricMeta(clusterUuid: string, cronTab: string): Promise<object> {
    const nexclipperApiUrl = config.appUrl + ':' + config.appPort + '/executor/syncMetricMeta';
    const cronData = {
      name: 'SyncMetricMeta',
      summary: 'SyncMetricMeta',
      cronTab: `30 */5 * * * *`, //Every min offset 30 sec`,
      apiUrl: nexclipperApiUrl,
      apiType: 'POST',
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: clusterUuid,
      apiBody: {
        clusterUuid: clusterUuid,
        cronTab: cronTab,
      },
    };
    const getResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    const getCustomerAccount = await this.customerAccountService.getCustomerAccountByKey(getResourceGroup.customerAccountKey);
    const resultSchedule = await this.schedulerService.createScheduler(cronData, getCustomerAccount.customerAccountId);
    console.log(resultSchedule);
    return resultSchedule;
  }
  /**
   * @param {string} clusterUuid
   * @param {string} cronTab
   */
  public async syncMetricReceived(clusterUuid: string, cronTab: string): Promise<object> {
    //let distinctJobList =[];
    let targetJobDbAll;
    let targetJobDb = [];
    const targetJobCron = [];
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
    const subscribed_channel = config.sudoryApiDetail.channel_metric_received;
    const cronJobKey = [];
    const cronJobKey_new = [];
    const cronJobKey_cancel = [];

    //validate clusterUuid& get customerAccountId
    const responseResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!responseResourceGroup) {
      throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);
    }
    const prometheus = responseResourceGroup.resourceGroupPrometheus;
    const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(responseResourceGroup.customerAccountKey);

    //pull metric target
    targetJobDb = await this.MetricMetaService.getDistinctJobOfMetricMetabyUuid(clusterUuid);
    if (!targetJobDb) {
      throw new HttpException(404, `No metric Job information with the clusterUuid: ${clusterUuid}`);
    }
    console.log('######## target job from db');
    console.log(targetJobDb);

    /* improvement/541 don't need to create job array
        targetJobDbAll = JSON.parse(JSON.stringify(distinctJobList));
        targetJobDb = targetJobDbAll.map(function (obj) {return obj.metricMetaTargetJob})
        console.log (targetJobDb);
        */

    //pull active metric-received job from nc-cron
    const resultFromCron = await this.schedulerService.getSchedulerByClusterId(clusterUuid);
    //console.log ("######## target job from scheduler");
    const newList = [];
    resultFromCron.map(data => {
      const { scheduleApiBody } = data;
      newList.push({ scheduleApiBody });
    });

    //filter only for metric_received
    const newFilterList = newList.filter(data => data.scheduleApiBody.subscribed_channel === subscribed_channel);

    //pull metricMetaTargetJob
    for (let i = 0; i < Object.keys(newFilterList).length; i++) {
      const steps = newFilterList[i].scheduleApiBody.steps;
      const query = steps.map(obj => {
        return obj.args.query;
      });
      const job = query.toString().substring(query.toString().indexOf('"') + 1, query.toString().lastIndexOf('"'));
      targetJobCron[i] = job;
    }
    console.log('###### from Cron ###############');
    console.log(targetJobCron);

    //start metric-received feeds for any new targets
    const newTargetJob = targetJobDb.filter(x => !targetJobCron.includes(x));
    console.log('filter result for new  ');
    console.log(newTargetJob);

    // call scheduleMetricReceived() with loop
    for (let n = 0; n < Object.keys(newTargetJob).length; n++) {
      const targetJob = newTargetJob[n];
      const metricQuery = `{job="` + targetJob + `"}`;
      const metricName = 'MetricReceived-' + targetJob;
      const metricSummary = targetJob;
      const cronData = {
        name: metricName,
        summary: metricSummary,
        cronTab: cronTab,
        apiUrl: executorServerUrl,
        apiType: 'POST',
        clusterId: clusterUuid,
        //accountId: customerAccountData.customerAccountId,
        reRunRequire: true,
        scheduleFrom: '',
        scheduleTo: '',
        apiBody: {
          cluster_uuid: clusterUuid,
          name: metricName,
          template_uuid: '10000000000000000000000000000001',
          summary: metricSummary,
          subscribed_channel: subscribed_channel,
          on_completion: on_completion,
          steps: [
            {
              args: {
                url: prometheus,
                query: metricQuery,
              },
            },
          ],
        },
      };
      const resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId);
      cronJobKey_new[n] = { key: resultNewCron.scheduleKey, jobname: targetJob, type: 'add' };
    }

    //cancel metric-received feeds for any retuired targets
    // call cancel method with loop
    const cancelTargetJob = targetJobCron.filter(x => !targetJobDb.includes(x));
    console.log('filter result for cancellation ');
    console.log(cancelTargetJob);
    //search the cron job and run cancellation loop

    for (let n = 0; n < Object.keys(cancelTargetJob).length; n++) {
      const targetJob = cancelTargetJob[n];
      const scheduleName = 'MetricReceived-' + targetJob;
      const resultFromCron = await this.schedulerService.getSchedulerByScheduleNameByClusterId(scheduleName, clusterUuid);
      const cancelFromCron = await this.schedulerService.cancelCronScheduleBySchedulerId(resultFromCron.scheduleId);
      cronJobKey_cancel[n] = { key: cancelFromCron.scheduleKey, jobname: targetJob, type: 'cancel' };
    }
    cronJobKey.concat(cronJobKey_new);
    cronJobKey.concat(cronJobKey_cancel);

    return cronJobKey;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} cronTab
   */
  public async syncResources(clusterUuid: string, cronTab: string): Promise<object> {
    //0. Preparation
    const targetJobCron = [];
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
    const subscribed_channel = config.sudoryApiDetail.channel_resource;
    const cronJobKey = [];

    const targetJobDb = [
      'K8s interface for Ingress',
      'K8s interface for Configmap',
      'K8s interface for PV',
      'K8s interface for PVC',
      'K8s interface for Secret',
      'K8s interface for Replicaset',
      'K8s interface for Statefulset',
      'K8s interface for Endpoint',
      'K8s interface for Daemonset',
      'K8s interface for Pod',
      'K8s interface for Deployment',
      'K8s interface for Namespace',
      'K8s interface for Node',
      'K8s interface for Service',
      'K8s interface for Storage Class',
      'K8s interface for Event',
      'K8s interface for Job',
      'K8s interface for CronJob',
    ];

    const resource_template = [
      { resourceName: 'Service', resourceType: 'SV', template_uuid: '00000000000000000000000000000020', jobName: 'K8s interface for Service' }, //service
      { resourceName: 'Node', resourceType: 'ND', template_uuid: '00000000000000000000000000000010', jobName: 'K8s interface for Node' }, // node
      { resourceName: 'Namespace', resourceType: 'NS', template_uuid: '00000000000000000000000000000004', jobName: 'K8s interface for Namespace' }, //namespace
      { resourceName: 'Pod', resourceType: 'PD', template_uuid: '00000000000000000000000000000002', jobName: 'K8s interface for Pod' }, //pod
      { resourceName: 'Deployment', resourceType: 'DP', template_uuid: '00000000000000000000000000001002', jobName: 'K8s interface for Deployment' }, //deployment
      {
        resourceName: 'Statefulset',
        resourceType: 'SS',
        template_uuid: '00000000000000000000000000001004',
        jobName: 'K8s interface for Statefulset',
      }, //statefulset
      { resourceName: 'Daemonset', resourceType: 'DS', template_uuid: '00000000000000000000000000001006', jobName: 'K8s interface for Daemonset' }, //daemonset
      { resourceName: 'Replicaset', resourceType: 'RS', template_uuid: '00000000000000000000000000001008', jobName: 'K8s interface for Replicaset' }, //replicaset
      { resourceName: 'PVC', resourceType: 'PC', template_uuid: '00000000000000000000000000000018', jobName: 'K8s interface for PVC' }, //pvc
      { resourceName: 'Secret', resourceType: 'SE', template_uuid: '00000000000000000000000000000014', jobName: 'K8s interface for Secret' }, //secret
      { resourceName: 'Endpoint', resourceType: 'EP', template_uuid: '00000000000000000000000000000016', jobName: 'K8s interface for Endpoint' }, //endpoint
      { resourceName: 'Configmap', resourceType: 'CM', template_uuid: '00000000000000000000000000000006', jobName: 'K8s interface for Configmap' }, //configmap
      { resourceName: 'Ingress', resourceType: 'IG', template_uuid: '00000000000000000000000000002002', jobName: 'K8s interface for Ingress' }, //ingress
      { resourceName: 'PV', resourceType: 'PV', template_uuid: '00000000000000000000000000000012', jobName: 'K8s interface for PV' }, //pv
      {
        resourceName: 'Storage Class',
        resourceType: 'SC',
        template_uuid: '00000000000000000000000000003002',
        jobName: 'K8s interface for Storage Class',
      }, //storageclass
      { resourceName: 'Event', resourceType: 'EV', template_uuid: '00000000000000000000000000000008', jobName: 'K8s interface for Event' }, //event
      { resourceName: 'Job', resourceType: 'JO', template_uuid: '00000000000000000000000000005002', jobName: 'K8s interface for Job' }, //job
      { resourceName: 'CronJob', resourceType: 'CJ', template_uuid: '00000000000000000000000000005003', jobName: 'K8s interface for CronJob' }, //cron-job
    ];

    //1. Validate clusterUuid and find customerAccountData
    const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!responseResourceGroup) {
      throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);
    }
    const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(responseResourceGroup.customerAccountKey);

    console.log('######## target job from db');
    console.log(targetJobDb);

    //2. pull active jobs of the cluster from nc-cron
    const resultFromCron = await this.schedulerService.getSchedulerByClusterId(clusterUuid);
    const newList = [];
    resultFromCron.map(data => {
      const { scheduleApiBody } = data;
      newList.push({ scheduleApiBody });
    });

    //3. filter only for resource
    const newFilterList = newList.filter(data => data.scheduleApiBody.subscribed_channel === subscribed_channel);
    //pull resourceJobName
    for (let i = 0; i < Object.keys(newFilterList).length; i++) {
      targetJobCron[i] = newFilterList[i].scheduleApiBody.name;
    }

    console.log('###### from Cron ###############');
    console.log(targetJobCron);

    //4. Find any missing resource Jobs
    const newTargetJob = targetJobDb.filter(x => !targetJobCron.includes(x));
    console.log('filter result for any missing resource jobs  ');
    console.log(newTargetJob);

    //5.  call nc_cron to schedule for missing jobs with loop
    for (let n = 0; n < Object.keys(newTargetJob).length; n++) {
      const targetJob = newTargetJob[n];
      const name = targetJob;
      const summary = targetJob;
      const selectedTemplate = resource_template.find(template => {
        return template.jobName === targetJob;
      });
      const template_uuid = selectedTemplate.template_uuid;
      const cronData = {
        name: name,
        summary: summary,
        cronTab: cronTab,
        apiUrl: executorServerUrl,
        apiType: 'POST',
        clusterId: clusterUuid,
        reRunRequire: true,
        scheduleFrom: '',
        scheduleTo: '',
        apiBody: {
          cluster_uuid: clusterUuid,
          name: name,
          template_uuid: template_uuid,
          summary: summary,
          subscribed_channel: subscribed_channel,
          on_completion: on_completion,
          steps: [
            {
              args: {
                labels: {},
              },
            },
          ],
        },
      };

      const resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId);
      cronJobKey[n] = { key: resultNewCron.scheduleKey, jobname: targetJob, type: 'add' };
    }

    return cronJobKey;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} cronTab
   */
  public async syncAlerts(clusterUuid: string, cronTab: string): Promise<object> {
    //0. Preparation
    const targetJobCron = [];
    const cronJobKey = [];
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
    const subscribed_channel = config.sudoryApiDetail.channel_alert;

    const targetJobDb = ['Get Alert Rules & Alert Received'];

    //1. Validate clusterUuid and find customerAccountData
    const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!responseResourceGroup) {
      throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);
    }
    const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(responseResourceGroup.customerAccountKey);
    const prometheus = responseResourceGroup.resourceGroupPrometheus;

    console.log('######## target job from db');
    console.log(targetJobDb);

    //2. pull active jobs of the cluster from nc-cron
    const resultFromCron = await this.schedulerService.getSchedulerByClusterId(clusterUuid);
    const newList = [];
    resultFromCron.map(data => {
      const { scheduleApiBody } = data;
      newList.push({ scheduleApiBody });
    });

    //3. filter only for resource
    const newFilterList = newList.filter(data => data.scheduleApiBody.subscribed_channel === subscribed_channel);
    //pull resourceJobName
    for (let i = 0; i < Object.keys(newFilterList).length; i++) {
      targetJobCron[i] = newFilterList[i].scheduleApiBody.name;
    }

    console.log('###### from Cron ###############');
    console.log(targetJobCron);

    //4. Find any missing resource Jobs
    const newTargetJob = targetJobDb.filter(x => !targetJobCron.includes(x));
    console.log('filter result for any missing alert jobs  ');
    console.log(newTargetJob);

    //5.  call nc_cron to schedule for missing jobs with loop
    for (let n = 0; n < Object.keys(newTargetJob).length; n++) {
      const targetJob = newTargetJob[n];
      const name = targetJob;
      const summary = targetJob;
      const selectedTemplate = '10000000000000000000000000000004';
      const template_uuid = selectedTemplate;
      const cronData = {
        name: name,
        summary: summary,
        cronTab: cronTab,
        apiUrl: executorServerUrl,
        apiType: 'POST',
        clusterId: clusterUuid,
        reRunRequire: true,
        scheduleFrom: '',
        scheduleTo: '',
        apiBody: {
          cluster_uuid: clusterUuid,
          name: name,
          template_uuid: template_uuid,
          summary: summary,
          subscribed_channel: subscribed_channel,
          on_completion: on_completion,
          steps: [
            {
              args: {
                url: prometheus,
              },
            },
          ],
        },
      };

      const resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId);
      cronJobKey[n] = { key: resultNewCron.scheduleKey, jobname: targetJob, type: 'add' };
    }

    return cronJobKey;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} cronTab
   */
  public async syncMetricMeta(clusterUuid: string, cronTab: string): Promise<object> {
    //0. Preparation
    const targetJobCron = [];
    const cronJobKey = [];
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
    const subscribed_channel = config.sudoryApiDetail.channel_metric;

    const targetJobDb = ['Get MetricMeta'];

    //1. Validate clusterUuid and find customerAccountData
    const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(clusterUuid);
    if (!responseResourceGroup) {
      throw new HttpException(404, `No ResourceGroup with the clusterUuid: ${clusterUuid}`);
    }
    const customerAccountData = await this.customerAccountService.getCustomerAccountByKey(responseResourceGroup.customerAccountKey);
    const prometheus = responseResourceGroup.resourceGroupPrometheus;

    console.log('######## target job from db');
    console.log(targetJobDb);

    //2. pull active jobs of the cluster from nc-cron
    const resultFromCron = await this.schedulerService.getSchedulerByClusterId(clusterUuid);
    const newList = [];
    resultFromCron.map(data => {
      const { scheduleApiBody } = data;
      newList.push({ scheduleApiBody });
    });

    //3. filter only for resource
    const newFilterList = newList.filter(data => data.scheduleApiBody.subscribed_channel === subscribed_channel);
    //pull resourceJobName
    for (let i = 0; i < Object.keys(newFilterList).length; i++) {
      targetJobCron[i] = newFilterList[i].scheduleApiBody.name;
    }

    console.log('###### from Cron ###############');
    console.log(targetJobCron);

    //4. Find any missing resource Jobs
    const newTargetJob = targetJobDb.filter(x => !targetJobCron.includes(x));
    console.log('filter result for any missing metric meta jobs  ');
    console.log(newTargetJob);

    //5.  call nc_cron to schedule for missing jobs with loop
    for (let n = 0; n < Object.keys(newTargetJob).length; n++) {
      const targetJob = newTargetJob[n];
      const name = targetJob;
      const summary = targetJob;
      const selectedTemplate = '10000000000000000000000000000007';
      const template_uuid = selectedTemplate;
      const cronData = {
        name: name,
        summary: summary,
        cronTab: cronTab,
        apiUrl: executorServerUrl,
        apiType: 'POST',
        clusterId: clusterUuid,
        reRunRequire: true,
        scheduleFrom: '',
        scheduleTo: '',
        apiBody: {
          cluster_uuid: clusterUuid,
          name: name,
          template_uuid: template_uuid,
          summary: summary,
          subscribed_channel: subscribed_channel,
          on_completion: on_completion,
          steps: [
            {
              args: {
                url: prometheus,
                match_target: '',
                metric: '',
                limit: '',
              },
            },
          ],
        },
      };

      const resultNewCron = await this.schedulerService.createScheduler(cronData, customerAccountData.customerAccountId);
      cronJobKey[n] = { key: resultNewCron.scheduleKey, jobname: targetJob, type: 'add' };
    }

    return cronJobKey;
  }
  /**
   * @param {SudoryWebhookDto} DataSetFromSudory
   */
  public async processSudoryWebhook(DataSetFromSudory: SudoryWebhookDto): Promise<object> {
    const uuid = require('uuid');
    const sudoryWebhookId = uuid.v1();
    let serviceResult;
    console.log('DatafromSudory', DataSetFromSudory);
    console.log(JSON.stringify(DataSetFromSudory.result));
    if (DataSetFromSudory.result === null) {
      serviceResult = [];
    } else {
      if (typeof DataSetFromSudory.result === 'string') {
        try {
          console.log('sudoryString');
          serviceResult = JSON.parse(DataSetFromSudory.result);
        } catch (e) {
          console.error(e);
          serviceResult = [];
        }
      } else {
        console.log('sudoryObject');
        serviceResult = JSON.parse(JSON.stringify(DataSetFromSudory.result));
      }
    }

    console.log('##sudorywebhook##');
    console.log(serviceResult);

    const insertData = {
      sudoryWebhookId: sudoryWebhookId,
      createdAt: new Date(),
      createdBy: 'SYSTEM',
      serviceUuid: DataSetFromSudory.service_uuid,
      clusterUuid: DataSetFromSudory.cluster_uuid,
      status: DataSetFromSudory.status,
      serviceName: DataSetFromSudory.service_name,
      serviceResult: serviceResult,
      serviceResultType: DataSetFromSudory.result_type,
      statusDescription: DataSetFromSudory.status_description,
      stepCount: DataSetFromSudory.step_count,
      stepPosition: DataSetFromSudory.step_position,
      //assignedClientUuid: DataSetFromSudory.assgined_client_uuid,
      templateUuid: DataSetFromSudory.template_uuid,
    };
    console.log(insertData);
    const resultSudoryWebhook = await this.sudoryWebhook.create(insertData);

    const data = {
      updatedAt: new Date(),
      updatedBy: 'SYSTEM',
      status: DataSetFromSudory.status,
      statusDescription: DataSetFromSudory.status_description,
    };
    const query = { where: { serviceUuid: DataSetFromSudory.service_uuid } };
    const resultExecutorService = await this.executorService.update(data, query);
    if (resultSudoryWebhook.status === 4 && resultSudoryWebhook.serviceName.startsWith('METRICOPS')) {
      //incident ID fetch
      let incidentId, customerAccountKey;
      const incidentString = resultSudoryWebhook.serviceName.indexOf('INC');
      if (incidentString) {
        const b = resultSudoryWebhook.serviceName.slice(incidentString);
        const c = b.indexOf('/');
        incidentId = b.slice(0, c);
      }
      const customerAccountString = resultSudoryWebhook.serviceName.indexOf('CUST');
      if (customerAccountString) {
        const b = resultSudoryWebhook.serviceName.slice(customerAccountString);
        const c = b.indexOf('/');
        customerAccountKey = b.slice(0, c);
      }
      //incidentActionPayload
      const actionData = {
        incidentActionName: resultSudoryWebhook.serviceName,
        incidentActionDescription: resultSudoryWebhook.statusDescription,
        incidentActionStatus: 'EX',
      };
      // create incident Action
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const incidentAction = await this.incidentService.createIncidentAction(customerAccountKey, incidentId, actionData, 'SYSTEM');

      //create incident Action attachement
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const parts = [new Blob([JSON.stringify(resultSudoryWebhook.serviceResult)], { type: 'text/json' })];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const incidentActionAttachmentFile = new File(parts, `${resultSudoryWebhook.serviceName}.json`, {
        lastModified: Date.now(),
        type: 'text/json',
      });

      const actionAttachmentData = {
        incidentActionAttachmentName: resultSudoryWebhook.serviceName,
        incidentActionAttachmentDescription: resultSudoryWebhook.statusDescription,
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: `${resultSudoryWebhook.serviceName}.json`,
      };
      await this.incidentService.createIncidentActionAttachment(
        customerAccountKey,
        incidentId,
        incidentAction.incidentActionId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        actionAttachmentData,
        'SYSTEM',
        incidentActionAttachmentFile,
      );
    }
    console.log(resultExecutorService);
    return resultSudoryWebhook;
  }

  /**
   * @param {string} serviceUuid
   */
  public async getSudoryWebhook(serviceUuid: string): Promise<ISudoryWebhook> {
    const resultSudoryWebhook: ISudoryWebhook = await this.sudoryWebhook.findOne({ where: { serviceUuid, status: { [Op.in]: [4, 8] } } });
    console.log(resultSudoryWebhook);
    return resultSudoryWebhook;
  }

  /**
   * @param {string} clusterUuid
   * @param {string} queryType
   * @param {string} stepQuery
   */
  public async postMetricRequest(clusterUuid: string, queryType: string, stepQuery: string, customerAccountKey: number): Promise<object> {
    console.log('method start');
    const name = 'postMetricReqeust for Incident Attachment';
    const summary = 'postMetricReqeust for Incident Attachment';
    let templateUuid = '';
    //let url = "http://kps-kube-prometheus-stack-prometheus.monitor.svc.cluster.local:9090";
    let steps;
    const start = new Date();
    start.setHours(start.getHours() - 1);
    const startString = start.toISOString();
    const endString = new Date().toISOString();
    const query = stepQuery;
    const sudoryChannel = config.sudoryApiDetail.channel_webhook;

    const ResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid: clusterUuid } });
    const url = ResourceGroup.resourceGroupPrometheus;

    if (queryType == 'range') {
      templateUuid = '10000000000000000000000000000002';
      steps = [{ args: { url: url, query: stepQuery, start: startString, end: endString, step: '15s' } }];
    } else {
      templateUuid = '10000000000000000000000000000001';
      steps = [{ args: { url: url, query: query } }];
    }
    const postMetricRequest = await this.postExecuteService(name, summary, clusterUuid, templateUuid, steps, customerAccountKey, sudoryChannel);
    return postMetricRequest;
  }

  /**
   * @param {string} executorServiceId
   */
  public async getExecutorServicebyExecutorServiceId(executorServiceId: string): Promise<IExecutorService> {
    const getExecutorService: IExecutorService = await this.executorService.findOne({ where: { executorServiceId } });
    return getExecutorService;
  }

  /**
   * @param {string} customerAccountId
   */
  public async getExecutorServicebyCustomerAccountId(customerAccountId: string): Promise<IExecutorService[]> {
    const getCustomerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);
    const customerAccountKey = getCustomerAccount.customerAccountKey;

    const getExecutorServiceAll: IExecutorService[] = await this.executorService.findAll({ where: { customerAccountKey } });
    return getExecutorServiceAll;
  }
}
export default executorService;
