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

        const customerAccountKey = 2;
        const metricReceivedMassFeed: IMetricReceivedMassFeed = req.body;

        const receivedData = JSON.parse(metricReceivedMassFeed.result);
        const clusterUuid = metricReceivedMassFeed.cluster_uuid 
        const receivedMetrics = receivedData.result;
        


        let newResultMap = [];
        receivedMetrics.map((data)=>{
          const{metric, value} = data;
          newResultMap.push(JSON.stringify({metric,values: [parseInt(value[1])], timestamps:[value[0]*1000]}))
        });
        const finalResult = (newResultMap).join("\n")
        //console.log("new result-------\n", finalResult);

        const massFeedResult = await this.massUploaderMongoService.massUpdoadMetricReceived(finalResult, clusterUuid);
        if (!massFeedResult) {
            return res.sendStatus(500);
          }
        res.status(200).json({ data: massFeedResult, message: `Bulk Metric Received feed - VM is successfully complete` });
      } catch (error) {
        next(error);
      }
    };

}

export default massUploaderMongoController;