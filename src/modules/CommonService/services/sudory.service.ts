import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { ISudoryClient } from '@/modules/CommonService/dtos/sudory.dto';

class sudoryService {

    public executorService = DB.ExecutorService; 

  /**
   * @param {string} clusterUuid
   * @param {string} templateUud
   * @param {string} name
   * @param {string} summary
   * @param {Object} steps
   */
   public async postSudoryService(name: string, summary: string, clusterUuid:string, templateUuid:string, steps:Object, customerAccountKey: number, subscribed_channel: string): Promise<object> {
    let on_completion=parseInt(config.sudoryApiDetail.service_result_delete);
    let sudoryBaseUrl = config.sudoryApiDetail.baseURL; 
    let sudoryPathService = config.sudoryApiDetail.pathService;
    let sudoryUrl = sudoryBaseUrl+sudoryPathService; 
    let uuid = require('uuid');
    let executorServiceId = uuid.v1();
    let sudoryChannel = subscribed_channel;

    let sudoryServiceData = {
      cluster_uuid: clusterUuid,
      name: name,
      template_uuid: templateUuid,
      steps: steps,
      summary: summary,
      on_completion: on_completion,
      subscribed_channel: sudoryChannel,
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
          subscribed_channel: sudoryChannel,
      }
      console.log("Data for DB insert: ");
      console.log(insertData);

      const resultSudoryService = await this.executorService.create(insertData); 

    console.log(resultSudoryService)
    return resultSudoryService;
}

 /**
   * @param {string} clusterUuid
  */
  public async checkSudoryClient(clusterUuid: string): Promise<ISudoryClient> {
    var clientData;
    var clientUuid = "";
    var expirationTime;
    var executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession;
    var resultReturn;
    var validClient:boolean;
    const sessionQueryParameter = `?q=(eq%20cluster_uuid%20"${clusterUuid}")`; 
    executorServerUrl = executorServerUrl + sessionQueryParameter;
    
    await axios(
    {
        method: 'get',
        url: `${executorServerUrl}`,
        headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
    }).then(async (res: any) => {
        if(!res.data[0]) {  
          console.log(`Executor/Sudory client not found yet from cluster: ${clusterUuid}`); 
          resultReturn = {
            clientUuid: "notfound",
            validClient: false,
          };
          return resultReturn;
        };
        clientData = Object.assign({},res.data[0]); 
        clientUuid = clientData.uuid;
        expirationTime = new Date(clientData.expiration_time);
        let currentTime = new Date();
        if (expirationTime> currentTime)
          validClient = true;
        else validClient = false;

        resultReturn = {
          clientUuid: clientUuid,
          validClient: validClient,
        };
        console.log (resultReturn)
        console.log(`Successful to run API to search Executor/Sudory client ${clientUuid}`);
    }).catch(error => {
        console.log(error);
        throw new HttpException(500, "Unknown error while searching executor/sudory client");
    });

    return resultReturn;

  }


}
export default sudoryService;