import VictoriaMetricService from "@modules/telemetry/victoriaMetric.service";
import QueryService from "../query/query";

class metricReceivedService {
  public victoriaMetricService = new VictoriaMetricService();
  public queryService = new QueryService();
  public async massUploadMetricReceivedNcp(totalMsg) {
    let queryResult: any = await this.queryService.getMetricQuery(totalMsg)
    return await this.massUploadMetricReceived(queryResult)
  }

  public async massUploadMetricReceived(totalMsg) {
    const clusterUuid = totalMsg.cluster_uuid;
    const name = totalMsg.service_name;
    let receivedData = totalMsg.result;

    try {
      totalMsg = null;
      let receivedMetrics = receivedData.result;
      receivedData = null;
      console.log(receivedMetrics)
      const message_size_mb = (Buffer.byteLength(JSON.stringify(receivedMetrics)))/1024/1024;
      console.log (`2. metric received name: ${name}, message size: ${message_size_mb}` );

      if (message_size_mb>5){
        const half = Math.ceil(receivedMetrics.length/2);
        const firstHalf = receivedMetrics.slice(0, half);
        const secondHalf = receivedMetrics.slice(-half);
        let newResultMap1 = [];
        firstHalf.map((data)=>{
          const{metric, value} = data;
          newResultMap1.push(JSON.stringify({metric, values: [parseFloat(value[1])], timestamps:[value[0]]}))
        });
        let finalResult1 = (newResultMap1).join("\n")
        newResultMap1 = null;
        let massFeedResult1 = await this.victoriaMetricService.callVM(finalResult1, clusterUuid);
        if (!massFeedResult1 || (massFeedResult1?.status !== 204)) {
          // console.log("Data Issue1 -----------------", finalResult1);
        }

        console.log(`3-1. massFeedResult 1/2: ${massFeedResult1?.status}, clusterUuid: ${clusterUuid}, name: ${name}`);
        finalResult1=null;
        massFeedResult1= null;

        let newResultMap2 = [];
        secondHalf.map((data)=>{
          const{metric, value} = data;
          newResultMap2.push(JSON.stringify({metric, values: [parseFloat(value[1])], timestamps:[value[0]]}))
        });
        let finalResult2 = (newResultMap2).join("\n")
        newResultMap2= null;
        let massFeedResult2 = await this.victoriaMetricService.callVM(finalResult2, clusterUuid);
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
          newResultMap.push(JSON.stringify({metric, values: [parseFloat(value[1])], timestamps:[value[0]]}))
        });
        let finalResult = (newResultMap).join("\n")
        console.log(finalResult)
        newResultMap = null;
        let massFeedResult = await this.victoriaMetricService.callVM(finalResult, clusterUuid);
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

}

export default metricReceivedService;
