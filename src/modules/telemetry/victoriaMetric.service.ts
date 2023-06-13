import config from '@/config';
import { isEmpty } from 'lodash';
import { logger } from '@/common/utils/logger';
import axios from '@common/httpClient/axios';
import { IResourceGroup } from "@common/interfaces/resourceGroup.interface";
import { HttpException } from "@common/exceptions/HttpException";
import { ICustomerAccount } from "@common/interfaces/customerAccount.interface";
import { DB } from "@/database";
class VictoriaMetricService {
  private vmUrl = config.victoriaMetrics.vmSingleUrl + config.victoriaMetrics.vmImport
  private vmMultiUrl = config.victoriaMetrics.vmMultiUrl + config.victoriaMetrics.vmImport
  public resourceGroup = DB.ResourceGroup;
  public customerAccount = DB.CustomerAccount;
  private vmOption = config.victoriaMetrics.vmOption ; //BOTH - both / SINGLE - single-tenant / MULTI - multi-tenant

  public async callVM (metricReceivedMassFeed, clusterUuid) {
    let result;
    if (this.vmOption === "SINGLE") {
      const url = this.vmUrl + clusterUuid;
      console.log (`2-1, calling vm interface: ${url}`);
      try {
        result = await axios.post (url, metricReceivedMassFeed, {maxContentLength:Infinity, maxBodyLength: Infinity})
        console.log("VM-single inserted:", result.status)
      } catch (error){
        console.log("error on calling vm api");
        //throw error;
      }
    } else if (this.vmOption === "MULTI") {
      let password;
      let username;
      try {
        const getResourceGroup: IResourceGroup = await this.resourceGroup.findOne({
          where: { resourceGroupUuid: clusterUuid, deletedAt: null },
        });
        if (!getResourceGroup) throw new HttpException(404, 'No resource Group');

        const getCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({
          where: { customerAccountKey: getResourceGroup.customerAccountKey, deletedAt: null },
        });

        username = 'I' + getCustomerAccount.customerAccountId;
        password = getCustomerAccount.customerAccountId;
      } catch (error) {
        console.log("error on confirming cluster information for metric feed");
        throw error;
      }
      const urlMulti = this.vmMultiUrl + clusterUuid;
      try {
        result = await axios.post(urlMulti, metricReceivedMassFeed, {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          auth: { username: username, password: password }
        })
      } catch (error) {
        console.log("error on calling vm api");
        throw error;
      }
    }

    metricReceivedMassFeed = null
    return result;
  }
}

export default VictoriaMetricService;
