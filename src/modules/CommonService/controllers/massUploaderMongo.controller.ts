import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { IMetricReceivedMassFeed} from '@/common/interfaces/massUploaderMongo.interface';
import massUploaderMongoService from '@/modules/CommonService/services/massUploaderMongo.service';

class massUploaderMongoController{

    public massUploaderMongoService = new massUploaderMongoService();

    public massUploadMongoForResource = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
      try {
        const resourceMassFeed = req.body;
        const massFeedResult = await this.massUploaderMongoService.massUploadResourceMongo(resourceMassFeed);
        if (!massFeedResult) {
            return res.sendStatus(500);
          }
        res.status(200).json({ data: massFeedResult, message: `Bulk Resource feed - mongo is successfully complete` });
      } catch (error) {
        next(error);
      }
    };

    public massUploadVMForMetricReceived = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
      try {

        const metricReceivedMassFeed: IMetricReceivedMassFeed = req.body;
        const receivedData = JSON.parse(metricReceivedMassFeed.result);
        const clusterUuid = metricReceivedMassFeed.cluster_uuid; 
        const receivedMetrics = receivedData.result;
        const message_size_mb = (Buffer.byteLength(JSON.stringify(receivedMetrics)))/1024/1024;
        console.log("message:size:", message_size_mb);
        if (message_size_mb>5){
          const half = Math.ceil(receivedMetrics.length/2);
          const firstHalf = receivedMetrics.slice(0, half); 
          const secondHalf = receivedMetrics.slice(-half);  

          let newResultMap1 = [];
          firstHalf.map((data)=>{
            const{metric, value} = data;
            newResultMap1.push(JSON.stringify({metric, values: [(value[1])], timestamps:[value[0]*1000]}))
          });
          let finalResult1 = (newResultMap1).join("\n")

          let massFeedResult1 = await this.massUploaderMongoService.massUpdoadMetricReceived(finalResult1, clusterUuid);
          if (!massFeedResult1) {
              return res.sendStatus(500);
            }

          let newResultMap2 = [];
          secondHalf.map((data)=>{
            const{metric, value} = data;
            newResultMap2.push(JSON.stringify({metric, values: [(value[1])], timestamps:[value[0]*1000]}))
          });
          let finalResult2 = (newResultMap2).join("\n")

          let massFeedResult2 = await this.massUploaderMongoService.massUpdoadMetricReceived(finalResult2, clusterUuid);
          if (!massFeedResult2) {
              return res.sendStatus(500);
            }

          res.status(200).json({ data: {...massFeedResult1, ...massFeedResult2}, message: `Bulk Metric Received feed - VM is successfully complete` });


        }
        else {
          let newResultMap = [];
          receivedMetrics.map((data)=>{
            const{metric, value} = data;
            newResultMap.push(JSON.stringify({metric, values: [(value[1])], timestamps:[value[0]*1000]}))
          });
          const finalResult = (newResultMap).join("\n")

          const massFeedResult = await this.massUploaderMongoService.massUpdoadMetricReceived(finalResult, clusterUuid);
          if (!massFeedResult) {
              return res.sendStatus(500);
            }
          res.status(200).json({ data: massFeedResult, message: `Bulk Metric Received feed - VM is successfully complete` });
          } //end of else 
          
          
      } catch (error) {
        next(error);
      }
    };

}

export default massUploaderMongoController;