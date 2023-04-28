import axios from "axios";
import DB from "@/database";
import { IResourceGroup } from "@common/interfaces/resourceGroup.interface";
import { HttpException } from "@common/exceptions/HttpException";
import { ICustomerAccount } from "@common/interfaces/customerAccount.interface";
import config from '@config/index';

class metricReceivedService {

  public resourceGroup = DB.ResourceGroup;
  public customerAccount = DB.CustomerAccount;

  // public async getMetricQuery(totalMsg, clusterUuid) {
  //   let queryResult = {};
  //   switch (totalMsg.template_uuid) {
  //     case "queryMultipleDataForServer":
  //       queryResult = await getQueryDataMultipleForServerVPC(totalMsg, clusterUuid)
  //       break;
  //   }
  //
  //   return queryResult;
  // }
  public async massUploadMetricReceived(metricReceivedMassFeed, clusterUuid) {
    try {
      let receivedData = metricReceivedMassFeed.result;
      const clusterUuid = metricReceivedMassFeed.cluster_uuid;
      const name = metricReceivedMassFeed.service_name;
      metricReceivedMassFeed = null;
      let receivedMetrics = receivedData.result;
      receivedData = null;
      const message_size_mb = (Buffer.byteLength(JSON.stringify(receivedMetrics)))/1024/1024;
      console.log (`2. metric received name: ${name}, message size: ${message_size_mb}` );

      if (message_size_mb>5){
        const half = Math.ceil(receivedMetrics.length/2);
        const firstHalf = receivedMetrics.slice(0, half);
        const secondHalf = receivedMetrics.slice(-half);
        let newResultMap1 = [];
        firstHalf.map((data)=>{
          const{metric, value} = data;
          newResultMap1.push(JSON.stringify({metric, values: [parseFloat(value[1])], timestamps:[value[0]*1000]}))
        });
        let finalResult1 = (newResultMap1).join("\n")
        newResultMap1 = null;
        let massFeedResult1 = await this.callVM(finalResult1, clusterUuid);
        if (!massFeedResult1 || (massFeedResult1?.status !== 204)) {
          // console.log("Data Issue1 -----------------", finalResult1);
        }

        console.log(`3-1. massFeedResult 1/2: ${massFeedResult1?.status}, clusterUuid: ${clusterUuid}, name: ${name}`);
        finalResult1=null;
        massFeedResult1= null;

        let newResultMap2 = [];
        secondHalf.map((data)=>{
          const{metric, value} = data;
          newResultMap2.push(JSON.stringify({metric, values: [parseFloat(value[1])], timestamps:[value[0]*1000]}))
        });
        let finalResult2 = (newResultMap2).join("\n")
        newResultMap2= null;
        let massFeedResult2 = await this.callVM(finalResult2, clusterUuid);
        if (!massFeedResult2 || (massFeedResult2?.status !== 204)) {
          // console.log("Data Issue2 -----------------", finalResult2);
        }

        console.log(`3-2, massFeedResult 2/2: ${massFeedResult2?.status}, clusterUuid: ${clusterUuid}, name: ${name}`);
        finalResult2=null;
        massFeedResult2= null;
      }
      else {
        let newResultMap = [];
        receivedMetrics.map((data)=>{
          const{metric, value} = data;
          newResultMap.push(JSON.stringify({metric, values: [parseFloat(value[1])], timestamps:[value[0]*1000]}))
        });
        let finalResult = (newResultMap).join("\n")
        newResultMap = null;
        let massFeedResult = await this.callVM(finalResult, clusterUuid);
        console.log(`3. massFeedResult: ${massFeedResult?.status}, clusterUuid: ${clusterUuid}, name: ${name}`);
        if (!massFeedResult || (massFeedResult?.status !== 204)) {
          // console.log("Data Issue -----------------", finalResult);
        }

        finalResult = null;
        massFeedResult= null;
      } //end of else

      receivedMetrics = null
    } catch (error) {
      console.log (`error on metricReceived - clusterUuid: ${clusterUuid}`, error);
      throw error;
    }
  }

  private async callVM (metricReceivedMassFeed, clusterUuid) {
    const vmUrl = config.victoriaMetrics.vmSingleImportUrl
    const vmMultiUrl = config.victoriaMetrics.vmMultiImportUrl
    const vmOption = config.victoriaMetrics.vmOption || "MULTI"; //BOTH - both / SINGLE - single-tenant / MULTI - multi-tenant
//just for local
//     const apiCustomerAccountGetUrl = apiUrl+ apiCustomerAccountGetPath;

    let result;
    if (vmOption === "SINGLE") {
      const url = vmUrl + clusterUuid;
      console.log (`2-1, calling vm interface: ${url}`);
      try {
        result = await axios.post (url, metricReceivedMassFeed, {maxContentLength:Infinity, maxBodyLength: Infinity})
        console.log("VM-single inserted:", result.status)
      } catch (error){
        console.log("error on calling vm api");
        //throw error;
      }
    } else if (vmOption === "MULTI") {
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
      const urlMulti = vmMultiUrl + clusterUuid;
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
    // } else { // BOTH
    //   const url = vmUrl + clusterUuid;
    //   console.log (`2-1, calling vm interface: ${url}`);
    //   try {
    //     result = await axios.post (url, metricReceivedMassFeed, {maxContentLength:Infinity, maxBodyLength: Infinity})
    //     console.log("VM-single inserted:", result.status)
    //   } catch (error){
    //
    //     console.log("error on calling vm api", error);
    //     console.log(metricReceivedMassFeed);
    //     throw error;
    //   }
    //   const urlCa = apiCustomerAccountGetUrl + "/" + clusterUuid;
    //   let password;
    //   let username;
    //   try {
    //     const customerAccount = await axios.get (urlCa);
    //     username = 'I' + customerAccount.data.data.customerAccountId;
    //     password = customerAccount.data.data.customerAccountId;
    //   } catch (error){
    //     console.log("error on confirming cluster information for metric feed");
    //     throw error;
    //   }
    //   const urlMulti = vmMultiUrl + clusterUuid;
    //   console.log (`2-2, calling vm multi - interface: ${urlMulti}`);
    //   try {
    //     result = await axios.post (urlMulti, metricReceivedMassFeed, {maxContentLength:Infinity, maxBodyLength: Infinity, auth:{username: username, password: password}})
    //     console.log("VM-multi inserted:", result.status)
    //   } catch (error){
    //     console.log("error on calling vm api");
    //     throw error;
    //   }
    // }

    metricReceivedMassFeed = null
    return result;
  }


}

export default metricReceivedService;
