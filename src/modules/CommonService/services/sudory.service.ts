import DB from '@/database';
import axios from 'common/httpClient/axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { ISudoryClient } from '@/modules/CommonService/dtos/sudory.dto';
import { IExecutorService } from '@/common/interfaces/executor.interface';
class sudoryService {
  public executorService = DB.ExecutorService;

  // /**
  //  * @param {string} clusterUuid
  //  * @param {string} templateUud
  //  * @param {string} name
  //  * @param {string} summary
  //  * @param {Object} steps
  //  */
  // public async postSudoryService(
  //   name: string,
  //   summary: string,
  //   clusterUuid: string,
  //   templateUuid: string,
  //   steps: Object,
  //   customerAccountKey: number,
  //   subscribed_channel: string,
  // ): Promise<object> {
  //   const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
  //   const sudoryBaseUrl = config.sudoryApiDetail.baseURL;
  //   const sudoryPathService = config.sudoryApiDetail.pathService;
  //   const sudoryUrl = sudoryBaseUrl + sudoryPathService;
  //   const uuid = require('uuid');
  //   const executorServiceId = uuid.v1();
  //   const sudoryChannel = subscribed_channel;

  //   const sudoryServiceData = {
  //     cluster_uuid: clusterUuid,
  //     name: name,
  //     template_uuid: templateUuid,
  //     steps: steps,
  //     summary: summary,
  //     on_completion: on_completion,
  //     subscribed_channel: sudoryChannel,
  //   };

  //   const serviceData = await axios({
  //     method: 'post',
  //     url: sudoryUrl,
  //     data: sudoryServiceData,
  //   })
  //     .then(async (res: any) => {
  //       const serviceUuid = res.data.uuid;
  //       console.log(`Submit sudory reqeust on ${clusterUuid} cluster successfully, serviceUuid is ${serviceUuid}`);
  //       return res.data;
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       throw new HttpException(500, 'Not able to execute service');
  //     });

  //   const insertData = {
  //     executorServiceId: executorServiceId,
  //     customerAccountKey: customerAccountKey,
  //     name: name,
  //     summary: summary,
  //     createdAt: new Date(),
  //     createdBy: 'SYSTEM',
  //     serviceUuid: serviceData.uuid,
  //     clusterUuid: serviceData.cluster_uuid,
  //     templateUuid: templateUuid,
  //     onCompletion: on_completion,
  //     steps: JSON.parse(JSON.stringify(steps)),
  //     subscribed_channel: sudoryChannel,
  //   };
  //   console.log('SUDORY# - insert Data to ExecutorService', insertData);

  //   const resultSudoryService: IExecutorService = await this.executorService.create(insertData);
  //   console.log('SUDORY# - inserted', resultSudoryService);
  //   return resultSudoryService;
  // }

  public async postSudoryServiceV2(
    name: string,
    summary: string,
    clusterUuid: string,
    templateUuid: string,
    inputs: Object,
    customerAccountKey: number,
    subscribed_channel: string,
  ): Promise<object> {
    const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
    const sudoryBaseUrl = config.sudoryApiDetail.baseURL;
    const sudoryPathService = config.sudoryApiDetail.pathServiceV2;
    const sudoryUrl = sudoryBaseUrl + sudoryPathService;
    const uuid = require('uuid');
    const executorServiceId = uuid.v1();
    const sudoryChannel = subscribed_channel;

    const sudoryServiceData = {
      cluster_uuid: clusterUuid,
      name: name,
      template_uuid: templateUuid,
      inputs: inputs,
      summary: summary,
      on_completion: on_completion,
      subscribed_channel: sudoryChannel,
    };

    const serviceData = await axios({
      method: 'post',
      url: sudoryUrl,
      data: sudoryServiceData,
    })
      .then(async (res: any) => {
        const serviceUuid = res.data.uuid;
        console.log(`Submit sudory reqeust on ${clusterUuid} cluster successfully, serviceUuid is ${serviceUuid}`);
        return res.data;
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Not able to execute service');
      });

    const insertData = {
      executorServiceId: executorServiceId,
      customerAccountKey: customerAccountKey,
      name: name,
      summary: summary,
      createdAt: new Date(),
      createdBy: 'SYSTEM',
      serviceUuid: serviceData.uuid,
      clusterUuid: serviceData.cluster_uuid,
      templateUuid: templateUuid,
      onCompletion: on_completion,
      inputs: JSON.parse(JSON.stringify(inputs)),
      subscribed_channel: sudoryChannel,
    };
    console.log('SUDORY# - insert Data to ExecutorService', insertData);

    const resultSudoryService: IExecutorService = await this.executorService.create(insertData);
    console.log('SUDORY# - inserted', resultSudoryService);
    return resultSudoryService;
  }

  /**
   * @param {string} clusterUuid
   */
  public async checkSudoryClient(clusterUuid: string): Promise<ISudoryClient> {
    const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession + '/cluster/' + clusterUuid + '/alive';
    console.log(executorServerUrl);
    let resultReturn;
    let validClient = false;
    //const sessionQueryParameter = `?q=(eq%20cluster_uuid%20"${clusterUuid}")`;
    //executorServerUrl = executorServerUrl + sessionQueryParameter;

    await axios({
      method: 'get',
      url: `${executorServerUrl}`,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        if (res.data.alive === true) validClient = true;
        console.log(`Successful to run API to search Executor/Sudory client`);
        resultReturn = { clusterUuid, validClient };
      })
      .catch(error => {
        //console.log(error);
        resultReturn = { clusterUuid, validClient };
      });

    return resultReturn;
  }
}
export default sudoryService;
