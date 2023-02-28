import DB from '@/database';
//import axios from 'common/httpClient/axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ISudoryClient } from '@/modules/CommonService/dtos/sudory.dto';

//import TableIdService from '@/modules/CommonService/services/tableId.service';
import SudoryService from '@/modules/CommonService/services/sudory.service';
import ExecutorService from '@/modules/CommonService/services/executor.service';
import SchedulerService from '@/modules/Scheduler/services/scheduler.service';
import { ICatalogPlan } from '@/common/interfaces/productCatalog.interface';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

class healthService {
  //    public tableIdService = new TableIdService();
  public sudoryService = new SudoryService();
  public executorService = new ExecutorService();
  public schedulerService = new SchedulerService();
  public customerAccount = DB.CustomerAccount;
  public subscription = DB.Subscription;
  public catalogPlan = DB.CatalogPlan;
  public resourceGroup = DB.ResourceGroup;

  public async checkHealth(): Promise<object> {
    const result = [];
    const getCustomerAccount: ICustomerAccount[] = await this.customerAccount.findAll({ where: { deletedAt: null } });

    if (getCustomerAccount.length > 0) {
      console.log('getCustomerAccount--', getCustomerAccount.length);
      for (let i = 0; i < getCustomerAccount.length; i++) {
        const customerAccountId = getCustomerAccount[i].customerAccountId;
        const response = await this.checkHealthByCustomerAccountId(customerAccountId);
        console.log('customerAccountId--', customerAccountId);
        console.log('response-----------', response);
        result.push(response);
      }
    }
    return result;
  }
  /**
   * @param {string} customerAccountId
   */
  public async checkHealthByCustomerAccountId(customerAccountId: string): Promise<object> {
    console.log('#HEALTH - start');
    const clusterStatus = [];
    //1. validateCustomerAccountId
    const queryCustomer = {
      where: { deleted_at: null, customerAccountId: customerAccountId },
    };
    const customerAccountData = await this.customerAccount.findOne(queryCustomer);
    if (!customerAccountData) {
      throw new HttpException(404, `Can't find customerAccount information: ${customerAccountId}`);
    }
    const customerAccountKey = customerAccountData.customerAccountKey;

    //2. pull resourceGroupAll
    const responseResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({ where: { deletedAt: null, customerAccountKey } });
    console.log('#HEALTH - Get ResourceGroup');

    //3 bring cron job..
    const resultCron = await this.schedulerService.getSchedulerByAccountId(customerAccountId);
    console.log('#HEALTH - Get Scheduler');
    const checkHealthByCustomerAccountIdFiltered = resultCron.filter(x => x.scheduleName == 'checkHealthByCustomerAccountId');
    const monitorMetricOpsJobFiltered = resultCron.filter(x => x.scheduleName == 'monitorMetricOpsJob');
    const syncAlertRuleFiltered = resultCron.filter(x => x.scheduleName == 'syncAlertRule');

    if (responseResourceGroup.length === 0) {
      clusterStatus.push({ message: `No ResourceGroup with the customerAccountId: ${customerAccountId}` });
    } else {
      //4. check sync services - resources, alerts, metricMeta, metricReceived
      const syncMetricMeta = resultCron.filter(x => x.scheduleName == 'SyncMetricMeta');
      const syncAlerts = resultCron.filter(x => x.scheduleName == 'SyncAlerts');
      const syncResources = resultCron.filter(x => x.scheduleName == 'SyncResources');
      const syncMetricReceived = resultCron.filter(x => x.scheduleName == 'SyncMetricReceived');
      console.log('#HEALTH - Get Sync jobs');

      //5. check schedule by cluster and rerun if the schedule cron is not running
      for (let i = 0; i < responseResourceGroup.length; i++) {
        //4. check sudoryclient
        const clusterUuid = responseResourceGroup[i].resourceGroupUuid;
        const sudoryRebounceRequest = responseResourceGroup[i].resourceGroupSudoryRebounceRequest;
        const resultExecutorClient: ISudoryClient = await this.sudoryService.checkSudoryClient(clusterUuid);
        console.log('#SUDORYHEALTH - resultExecutorClient', resultExecutorClient);
        console.log('#SUDORYHEALTH - sudoryRebounceRequest', sudoryRebounceRequest);
        if (!resultExecutorClient || resultExecutorClient.validClient === false) {
          clusterStatus[i] = {
            resourceGroupUuid: clusterUuid,
            sudoryClient: false,
          };
          if (sudoryRebounceRequest === 'N' || !sudoryRebounceRequest) {
            // To Do - 4.1 call sudory api to restart sudory client
            const sudoryName = 'sudory_client_rebounce';
            const sudorySummary = 'sudory_client_summary';
            const templateUuid = '99990000000000000000000000000001';
            const inputs = {};
            const subscribed_channel = config.sudoryApiDetail.channel_webhook;
            const resultSuodryCall = this.sudoryService.postSudoryServiceV2(
              sudoryName,
              sudorySummary,
              clusterUuid,
              templateUuid,
              inputs,
              customerAccountKey,
              subscribed_channel,
            );
            console.log('#HEALTH - Sudory Client Restart:', resultSuodryCall);
            const updateResourceGroup = await this.resourceGroup.update(
              { resourceGroupSudoryRebounceRequest: 'Y' },
              { where: { deletedAt: null, resourceGroupUuid: clusterUuid } },
            );
            console.log('#SUDORYHEALTH - updateResourceGroup to Y', updateResourceGroup);
          }
        } else if (resultExecutorClient.validClient === true) {
          clusterStatus[i] = {
            resourceGroupUuid: clusterUuid,
            sudoryClient: true,
          };
          if (sudoryRebounceRequest === 'Y') {
            const updateResourceGroup = await this.resourceGroup.update(
              { resourceGroupSudoryRebounceRequest: 'N' },
              { where: { deletedAt: null, resourceGroupUuid: clusterUuid } },
            );
            console.log('#SUDORYHEALTH - updateResourceGroup Y to No', updateResourceGroup);
          }
          console.log('#HEALTH - Sudory Client Status Good');
        }

        const syncMetricMetaFiltered = syncMetricMeta.filter(data => data.scheduleApiBody.clusterUuid === clusterUuid);
        if (syncMetricMetaFiltered.length === 0) {
          clusterStatus[i].syncMetricMeta = false;
          //call scheduleSyncMetricMeta
          const resultScheduleSyncMetricMeta = await this.executorService.scheduleSyncMetricMeta(clusterUuid, config.metricCron);
          if (resultScheduleSyncMetricMeta) clusterStatus[i].syncMetricMetaAction = true;
        } else {
          clusterStatus[i].syncMetricMeta = true;
        }

        if (config.metricReceivedSwitch === 'on') {
          const syncMetricReceivedFiltered = syncMetricReceived.filter(data => data.scheduleApiBody.clusterUuid === clusterUuid);
          if (syncMetricReceivedFiltered.length === 0) {
            clusterStatus[i].syncMetricReceived = false;
            //call scheduleSyncMetricReceived
            const resultScheduleSyncMetricReceived = await this.executorService.scheduleSyncMetricReceived(clusterUuid, config.metricReceivedCron);
            if (resultScheduleSyncMetricReceived) clusterStatus[i].syncMetricReceivedAction = true;
          } else {
            clusterStatus[i].syncMetricReceived = true;
          }
        } else clusterStatus[i].syncMetricReceived = true;

        const syncAlertsFiltered = syncAlerts.filter(data => data.scheduleApiBody.clusterUuid === clusterUuid);
        if (syncAlertsFiltered.length === 0) {
          clusterStatus[i].syncAlerts = false;
          //call scheduleSyncAlerts
          const resultScheduleSyncAlerts = await this.executorService.scheduleSyncAlerts(clusterUuid, config.alertCron);
          if (resultScheduleSyncAlerts) clusterStatus[i].syncAlertsAction = true;
        } else {
          clusterStatus[i].syncAlerts = true;
        }

        const syncResourcesFiltered = syncResources.filter(data => data.scheduleApiBody.clusterUuid === clusterUuid);
        if (syncResourcesFiltered.length === 0) {
          clusterStatus[i].syncResources = false;
          //call scheduleSyncResources
          const resultScheduleSyncResources = await this.executorService.scheduleSyncResources(clusterUuid, config.resourceCron);
          if (resultScheduleSyncResources) clusterStatus[i].syncResourcesAction = true;
        } else {
          clusterStatus[i].syncResources = true;
        }
      } // end of for
    }
    //4.2 check schedule by account id.. customerAccount level
    if (checkHealthByCustomerAccountIdFiltered.length === 0) {
      const resultScheduleCheckHealth = await this.scheduleCheckHealthByCustomerAccountId(customerAccountId, config.alertCron);
      clusterStatus.push({ CustomerHealthCheck: 'added' });
    }
    console.log('#HEALTH - checkHealthByCustomerAccountJob');

    //check whether the customer has metricOps Job
    const resultMetricOpsSubscription: ISubscriptions[] = await this.subscription.findAll({
      where: { deletedAt: null, customerAccountKey, subscriptionStatus: 'AC' },
    });
    if (resultMetricOpsSubscription.length > 0) {
      for (let i = 0; i < resultMetricOpsSubscription.length; i++) {
        const catalogPlanKey = resultMetricOpsSubscription[i].catalogPlanKey;
        const getCatallogPlan: ICatalogPlan = await this.catalogPlan.findOne({
          where: { catalogPlanKey, deletedAt: null },
        });
        if (getCatallogPlan.catalogPlanType == 'MO') {
          if (monitorMetricOpsJobFiltered.length === 0) {
            console.log('MetricOpsJob is cancalled --------- ');
            const resultScheduleMonitorMetricOps = await this.scheduleMonitorMetricOpsByCustomerAccountId(customerAccountId, config.metricOpsCron);
            console.log('MetricOps Evaluation Scheduled', resultScheduleMonitorMetricOps);
          }
          if (syncAlertRuleFiltered.length === 0) {
            console.log('syncAlertRule is cancalled --------- ');
            const resultSyncAlertRuleFiltered = await this.scheduleSyncAlertRuleByCustomerAccountId(customerAccountId, config.metricOpsCron);
            console.log('syncAlertRule Scheduled', resultSyncAlertRuleFiltered);
          }
          i = resultMetricOpsSubscription.length;
          clusterStatus.push({ MonitorMetricOps: 'added' });
        }
      }
    }
    console.log('#HEALTH - check MetricOpsJob');
    return clusterStatus;
  }

  /**
   * @param {string} customerAccountId
   * @param {string} cronTab
   */
  public async scheduleCheckHealthByCustomerAccountId(customerAccountId: string, cronTab: string): Promise<object> {
    const nexclipperApiUrl = config.appUrl + ':' + config.appPort + '/health/customerAccount';
    const cronData = {
      name: 'checkHealthByCustomerAccountId',
      summary: 'checkHealthByCustomerAccountId',
      cronTab: cronTab,
      apiUrl: nexclipperApiUrl,
      apiType: 'POST',
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: '',
      apiBody: {
        customerAccountId: customerAccountId,
      },
    };
    const resultSchedule = await this.schedulerService.createScheduler(cronData, customerAccountId);
    console.log(resultSchedule);
    return resultSchedule;
  }

  /**
   * @param {string} customerAccountId
   * @param {string} cronTab
   */
  public async scheduleMonitorMetricOpsByCustomerAccountId(customerAccountId: string, cronTab: string): Promise<object> {
    const nexclipperApiUrl = config.appUrl + ':' + config.appPort + '/evaluate/customerAccount';
    const cronData = {
      name: 'monitorMetricOpsJob',
      summary: 'monitorMetricOpsJob',
      cronTab: cronTab,
      apiUrl: nexclipperApiUrl,
      apiType: 'POST',
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: '',
      apiBody: {
        customerAccountId: customerAccountId,
      },
    };
    const resultSchedule = await this.schedulerService.createScheduler(cronData, customerAccountId);
    console.log(resultSchedule);
    return resultSchedule;
  }

  /**
   * @param {string} customerAccountId
   * @param {string} cronTab
   */
  public async scheduleSyncAlertRuleByCustomerAccountId(customerAccountId: string, cronTab: string): Promise<object> {
    const nexclipperApiUrl = config.appUrl + ':' + config.appPort + '/ruleGroup/alertRule/sync';
    const cronData = {
      name: 'syncAlertRule',
      summary: 'syncAlertRule',
      cronTab: cronTab,
      apiUrl: nexclipperApiUrl,
      apiType: 'POST',
      reRunRequire: true,
      scheduleFrom: '',
      scheduleTo: '',
      clusterId: '',
      apiBody: {
        customerAccountId: customerAccountId,
      },
    };
    const resultSchedule = await this.schedulerService.createScheduler(cronData, customerAccountId);
    console.log(resultSchedule);
    return resultSchedule;
  }
}
export default healthService;
