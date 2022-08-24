import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ISudoryClient } from '@/modules/CommonService/dtos/sudory.dto';

//import TableIdService from '@/modules/CommonService/services/tableId.service';
//import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import SudoryService from '@/modules/CommonService/services/sudory.service';
import ExecutorService from '@/modules/CommonService/services/executor.service';
import SchedulerService from '@/modules/Scheduler/services/scheduler.service';

class healthService {
    //    public tableIdService = new TableIdService();
    //    public customerAccountService = new CustomerAccountService();
        public resourceGroupService = new ResourceGroupService();
        public sudoryService = new SudoryService();
        public executorService = new ExecutorService();
        public schedulerService = new SchedulerService();
        public customerAccount = DB.CustomerAccount;

   /**
   * @param {string} customerAccountId
   */
    public async checkHealthByCustomerAccountId(customerAccountId: string): Promise<object> {

       //1. validateCustomerAccountId
       
        let queryCustomer = {
            where:
            {deleted_at: null,
             customerAccountId: customerAccountId,
            }
        };
        let customerAccountData = await this.customerAccount.findOne(queryCustomer);
        //let customerAccountData = await this.customerAccountService.getCustomerAccountById(customerAccountId);
        if (!customerAccountData) {
            throw new HttpException(404, `Can't find customerAccount information: ${customerAccountId}`);   
        }
        let customerAccountKey = customerAccountData.customerAccountKey;

        //2. pull resourceGroupAll
        let responseResourceGroup: IResourceGroup[] =  await this.resourceGroupService.getResourceGroupByCustomerAccountId(customerAccountId);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the customerAccountId: ${customerAccountId}`);   
        }

        //3. check sync services - resources, alerts, metricMeta, metricReceived
        //3.1 bring cron job..
        let resultCron = await this.schedulerService.getSchedulerByAccountId(customerAccountId);

        //3.2 pull Sync jobs
        let syncMetricMeta = resultCron.filter(x => x.scheduleName == 'SyncMetricMeta');
        let syncAlerts = resultCron.filter(x => x.scheduleName == 'SyncAlerts');
        let syncResources = resultCron.filter(x => x.scheduleName == 'SyncResources');
        let syncMetricReceived = resultCron.filter(x => x.scheduleName == 'SyncMetricReceived');

        var clusterStatus = [];
        for (let i=0; i<responseResourceGroup.length; i++){
        //4. check sudoryclient
            let clusterUuid = responseResourceGroup[i].resourceGroupUuid; 
            let resultExecutorClient:ISudoryClient  = await this.sudoryService.checkSudoryClient(clusterUuid);
            if (!resultExecutorClient || resultExecutorClient.validClient==false) {
                clusterStatus[i] = {
                                resourceGroupUuid: clusterUuid,
                                sudoryClient: false, 
                }
        // To Do - 4.1 call sudory api to restart sudory client
                let sudoryName = "sudory_client_rebounce";
                let sudorySummary = "sudory_client_summary";
                let templateUuid = "99990000000000000000000000000001";
                let steps = [{"Args": {}}];
                let subscribed_channel = config.sudoryApiDetail.channel_webhook;
                const resultSuodryCall = this.executorService.postExecuteService(sudoryName, sudorySummary, clusterUuid, templateUuid, steps, customerAccountKey, subscribed_channel);
                console.log (resultSuodryCall); 
            }
            else {
                clusterStatus[i] = {
                    resourceGroupUuid: clusterUuid,
                    sudoryClient: true, 
                }
            }

            let syncMetricMetaFiltered = syncMetricMeta.filter(data=>data.scheduleApiBody.clusterUuid === clusterUuid);
            if (syncMetricMetaFiltered.length===0) {
                clusterStatus[i].syncMetricMeta = false;
                //call scheduleSyncMetricMeta
                let resultScheduleSyncMetricMeta = await this.executorService.scheduleSyncMetricMeta(clusterUuid, config.metricCron);
                if (resultScheduleSyncMetricMeta) clusterStatus[i].syncMetricMetaAction = true; 
            }
            else {
                clusterStatus[i].syncMetricMeta = true;
            }

            let syncMetricReceivedFiltered = syncMetricReceived.filter(data=>data.scheduleApiBody.clusterUuid === clusterUuid);
            if (syncMetricReceivedFiltered.length===0) {
                clusterStatus[i].syncMetricReceived = false;
                //call scheduleSyncMetricReceived
                let resultScheduleSyncMetricReceived = await this.executorService.scheduleSyncMetricReceived(clusterUuid, config.metricReceivedCron);
                if (resultScheduleSyncMetricReceived) clusterStatus[i].syncMetricReceivedAction = true; 
            }
            else {
                clusterStatus[i].syncMetricReceived = true;
            }

            let syncAlertsFiltered = syncAlerts.filter(data=>data.scheduleApiBody.clusterUuid === clusterUuid);
            if (syncAlertsFiltered.length===0) {
                clusterStatus[i].syncAlerts = false;
                //call scheduleSyncAlerts
                let resultScheduleSyncAlerts = await this.executorService.scheduleSyncAlerts(clusterUuid,config.alertCron);
                if (resultScheduleSyncAlerts) clusterStatus[i].syncAlertsAction = true; 
            }
            else {
                clusterStatus[i].syncAlerts = true;
            }

            let syncResourcesFiltered = syncResources.filter(data=>data.scheduleApiBody.clusterUuid === clusterUuid);
            if (syncResourcesFiltered.length===0) {
                clusterStatus[i].syncResources = false;
                //call scheduleSyncResources
                let resultScheduleSyncResources = await this.executorService.scheduleSyncResources(clusterUuid, config.resourceCron); 
                if (resultScheduleSyncResources) clusterStatus[i].syncResourcesAction = true; 
            }
            else {
                clusterStatus[i].syncResources = true;
            }

        } // end of for


       
        return clusterStatus;
    }    

   /**
   * @param {string} customerAccountId
   * @param {string} cronTab
   */
    public async scheduleCheckHealthByCustomerAccountId(customerAccountId: string, cronTab: string): Promise<object> {

        const nexclipperApiUrl = config.appUrl + ":" + config.appPort + "/health/customerAccount";
        const cronData = { name: "checkHeathByCustomerAccountId",
        summary: "checkHeathByCustomerAccountId",
        cronTab: cronTab,
        apiUrl: nexclipperApiUrl,
        reRunRequire: true,
        scheduleFrom: "",
        scheduleTo: "",
        clusterId: "",
        apiBody:
            {
                customerAccountId: customerAccountId,
                cronTab: cronTab
            }
      };
      const resultSchedule = await this.schedulerService.createScheduler(cronData, customerAccountId); 
      console.log (resultSchedule); 
      return resultSchedule; 
    }

    }
    export default healthService;