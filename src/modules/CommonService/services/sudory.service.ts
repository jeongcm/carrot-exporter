import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';

class sudoryService {

    public executorService = DB.ExecutorService; 

  /**
   * @param {string} clusterUuid
   * @param {string} templateUud
   * @param {string} name
   * @param {string} summary
   * @param {Object} steps
   */
   public async postSudoryService(name: string, summary: string, clusterUuid:string, templateUuid:string, steps:Object, customerAccountKey: number): Promise<object> {
    let on_completion=parseInt(config.sudoryApiDetail.service_result_delete);
    let sudoryBaseUrl = config.sudoryApiDetail.baseURL; 
    let sudoryPathService = config.sudoryApiDetail.pathService;
    let sudoryUrl = sudoryBaseUrl+sudoryPathService; 
    let uuid = require('uuid');
    let executorServiceId = uuid.v1();

    let sudoryServiceData = {
      cluster_uuid: clusterUuid,
      name: name,
      template_uuid: templateUuid,
      steps: steps,
      summary: summary,
      on_completion: on_completion,
      subscribed_channel: 'webhook_test',
    };
    console.log(sudoryServiceData); 
    let serviceData = await axios(
      {
        method: 'post',
        url: sudoryUrl,
        data: sudoryServiceData,
      }).then(async (res: any) => {
          //serviceUuid = res.data.uuid
        return res.data
        // console.log(`Submit sudory reqeust on ${clusterUuid} cluster successfully, serviceUuid is ${serviceUuid}`);

      }).catch(error => {
        console.log(error);
        throw new HttpException(500, "Not able to execute service");
      });

      const insertData = {
          executorServiceId: executorServiceId,
          customerAccountKey: customerAccountKey,
          name: name,
          summary: summary,
          createdAt: new Date(),
          createdBy: "SYSTEM",
          serviceUuid: serviceData.uuid,
          clusterUuid: serviceData.cluster_uuid,
          templateUuid: templateUuid,
          onCompletion: on_completion,
          steps: JSON.parse(JSON.stringify(steps)),
          subscribed_channel: 'webhook_test',
      }
      console.log("Data for DB insert: ");
      console.log(insertData);

      const resultSudoryService = await this.executorService.create(insertData); 

    console.log(resultSudoryService)
    return resultSudoryService;
}      
}
export default sudoryService;