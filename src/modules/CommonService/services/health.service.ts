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
import ExecutorService from '@/modules/CommonService/services/executor.service';
import SchedulerService from '@/modules/Scheduler/services/scheduler.service';
import { IExecutorService } from '@/common/interfaces/executor.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

class healthService {
    //    public tableIdService = new TableIdService();
        public customerAccountService = new CustomerAccountService();
        public resourceGroupService = new ResourceGroupService();
        public executorService = new ExecutorService();
        public schedulerService = new SchedulerService();
        public sudoryWebhookModel = DB.SudoryWebhook; 
        public executorServiceModel = DB.ExecutorService; 
        public resourceGroupModel = DB.ResourceGroup;
        public exportersModel = DB.Exporters;

   /**
   * @param {string} customerAccountId
   * @param {string} cronTab
   */
    public async checkHealthByCustomerAccountId(customerAccountId: string, cronTab: string): Promise<object> {

       //1. validateCustomerAccountId
       
        let customerAccountData = await this.customerAccountService.getCustomerAccountById(customerAccountId);
        if (!customerAccountData) {
            throw new HttpException(404, `Can't find customerAccount information: ${customerAccountId}`);   
        }
        let customerAccountKey = customerAccountData.customerAccountKey;

        //2. pull resourceGroupAll
        let responseResourceGroup: IResourceGroup[] =  await this.resourceGroupService.getResourceGroupByCustomerAccountId(customerAccountId);
        if (!responseResourceGroup) {
            throw new HttpException(404, `No ResourceGroup with the customerAccountId: ${customerAccountId}`);   
        }
        console.log ("all clusters");
        console.log (responseResourceGroup);

        for (let i=0; i<responseResourceGroup.length; i++){
            //3. check sudoryclient
            let clusterUuid = responseResourceGroup[i].resourceGroupUuid; 
            let resultExecutorClient = await this.executorService.checkExecutorClientOnly(clusterUuid, customerAccountKey); 
            console.log ("each cluster - sudory status");
            console.log (resultExecutorClient); 
        }
       
        return responseResourceGroup;
    }    



    }
    export default healthService;