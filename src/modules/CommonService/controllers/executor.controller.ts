import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { ExecutorDto, IExecutorClient, IExecutorClientCheck } from '@/modules/CommonService/dtos/executor.dto';
import executorService from '../services/executor.service';
import { HttpException } from '@/common/exceptions/HttpException';

class executorController {
  public executorService = new executorService();

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public checkExecutorResourceResponse = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const serviceUuid = req.params.serviceUuid;

      const executorServiceResult = await this.executorService.checkExecutorResourceResponse(serviceUuid);
      if (!executorServiceResult) {
        return res.sendStatus(404);
      }
      if (executorServiceResult.serviceUuid) {
        res.status(200).json({ data: executorServiceResult, message: `well received the service execution result of service uuid: ${serviceUuid}` });
      } else {
        res.status(200).json({ data: executorServiceResult, message: `waiting for service execution result of service uuid: ${serviceUuid}` });
      }
    } catch (error) {
      next(error);
    }
  }; // end of method

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public checkExecutorResponse = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const serviceUuid = req.params.serviceUuid;

      const executorServiceResult = await this.executorService.checkExecutorResponse(serviceUuid);
      if (!executorServiceResult) {
        return res.sendStatus(404);
      }
      if (executorServiceResult.serviceUuid) {
        res.status(200).json({ data: executorServiceResult, message: `well received the service execution result of service uuid: ${serviceUuid}` });
      } else {
        res.status(200).json({ data: executorServiceResult, message: `waiting for service execution result of service uuid: ${serviceUuid}` });
      }
    } catch (error) {
      next(error);
    }
  }; // end of method

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public registerExecutorClient = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const requestExecutorClient: ExecutorDto = req.body;
    const resourceGroupName = req.body.resourceGroupName;
    const currentUserId = req.user.partyId;

    try {
      const executorClient: IExecutorClient = await this.executorService.registerExecutorClient(requestExecutorClient, currentUserId);
      res.status(200).json({ data: executorClient, message: `create executor for cluster(${resourceGroupName}) ` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public checkExecutorClient = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.params.clusterUuid;
      const customerAccountKey = req.customerAccountKey;

      const clientResponse: IExecutorClientCheck = await this.executorService.checkExecutorClient(clusterUuid, customerAccountKey);

      if (clientResponse) {
        res
          .status(200)
          .json({ data: clientResponse, message: `Success to confirm Executor/Sudory client: clientUuid: ${clientResponse.clientUuid}` });
      } else {
        res.status(404).json({ data: clientResponse, message: `Executor/Sudory client not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public installKpsOnResourceGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const targetNamespace = req.body.targetNamespace;
      const customerAccountKey = req.customerAccountKey;
      const systemId = req.systemId;

      const serviceUuid: string = await this.executorService.installKpsOnResourceGroup(clusterUuid, customerAccountKey, targetNamespace, systemId);
      res
        .status(200)
        .json({ serviceUuid: serviceUuid, message: `Successfullyt submit kps stack installation service request on cluserUuid: ${clusterUuid}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public requestResourceToExecutor = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const targetNamespace = req.body.targetNamespace;
      const resourceType = req.body.resourceType;
      const name = req.body.name;
      const labels = req.body.labels;

      const requestDataset = { clusterUuid: clusterUuid, targetNamespace: targetNamespace, resourceType: resourceType, name: name, labels: labels };

      const serviceUuid: string = await this.executorService.requestResourceToExecutor(requestDataset);
      res
        .status(200)
        .json({ serviceUuid: serviceUuid, message: `Successfullyt submit k8s resource list service request on cluserUuid: ${clusterUuid}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public scheduleMetricMeta = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      //const targetNamespace = req.body.targetNamespace;
      const customerAccountKey = req.customerAccountKey;

      const cronJobKey: string = await this.executorService.scheduleMetricMeta(clusterUuid, customerAccountKey);
      res.status(200).json({ cronJobResult: cronJobKey, message: `Successfullyt schedule metric meta job` });
    } catch (error) {
      next(error);
    }
  };
  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public scheduleAlert = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const customerAccountKey = req.customerAccountKey;
      const cronJobKey: string = await this.executorService.scheduleAlert(clusterUuid, customerAccountKey);
      res.status(200).json({ cronJobResult: cronJobKey, message: `Successfullyt schedule alert job` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public scheduleMetricReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      //const targetNamespace = req.body.targetNamespace;
      const customerAccountKey = req.customerAccountKey;

      const cronJobKey: object = await this.executorService.scheduleMetricReceived(clusterUuid, customerAccountKey);
      res.status(200).json({ cronJobKey: cronJobKey, message: `Successfullyt schedule metric received jobs` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public scheduleResource = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const resourceType = req.body.resourceType;
      const cronTab = req.body.cronTab;
      const customerAccountKey = req.customerAccountKey;

      const cronJobKey: string = await this.executorService.scheduleResource(clusterUuid, customerAccountKey, resourceType, cronTab);
      res.status(200).json({ cronJobKey: cronJobKey, message: `Successfullyt schedule resource interfaces` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public processSudoryWebhook = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.body) throw new HttpException(404, 'no req dataset');

      const resultSudoryWebhook: object = await this.executorService.processSudoryWebhook(req.body);
      res.status(200).json({ data: resultSudoryWebhook, message: `Successfully process SudoryWebhook` });
    } catch (error) {
      next(error);
    }
  };
  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getSudoryWebhook = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      //for development purpose only START

      // let sampleData = {"resultType":"vector","result":[{"metric":{"container":"mariadb","cpu":"total","endpoint":"https-metrics","id":"/kubepods/besteffort/pod5cffe7b5-dd05-4f40-b470-42c57d56487f/eae1992806da2a7690d033efb2bb69d84cebab7e0ca4cde25b921fc0ea6ca2fd","image":"sha256:e9bfcbefa4a9e6328f0436a331b01a36944d4b7e182e1ed2594148d634631df4","instance":"10.124.0.26:10250","job":"kubelet","metrics_path":"/metrics/cadvisor","name":"eae1992806da2a7690d033efb2bb69d84cebab7e0ca4cde25b921fc0ea6ca2fd","namespace":"mariadb","node":"new-node-cairz","pod":"ncdb-mariadb-primary-0","service":"kps-kube-prometheus-stack-kubelet"},"value":[1654711718.113,"0.006002854706304252"]},{"metric":{"cpu":"total","endpoint":"https-metrics","id":"/kubepods/besteffort/pod5cffe7b5-dd05-4f40-b470-42c57d56487f","instance":"10.124.0.26:10250","job":"kubelet","metrics_path":"/metrics/cadvisor","namespace":"mariadb","node":"new-node-cairz","pod":"ncdb-mariadb-primary-0","service":"kps-kube-prometheus-stack-kubelet"},"value":[1654711718.113,"0.0061209236775169665"]},{"metric":{"cpu":"total","endpoint":"https-metrics","id":"/kubepods/besteffort/pod5cffe7b5-dd05-4f40-b470-42c57d56487f/92bb23bf985148a082370cfe41769a1803b274d349e7aef0754054d17ca9468f","image":"k8s.gcr.io/pause:3.2","instance":"10.124.0.26:10250","job":"kubelet","metrics_path":"/metrics/cadvisor","name":"92bb23bf985148a082370cfe41769a1803b274d349e7aef0754054d17ca9468f","namespace":"mariadb","node":"new-node-cairz","pod":"ncdb-mariadb-primary-0","service":"kps-kube-prometheus-stack-kubelet"},"value":[1654711718.113,"0"]}]};
      // res.status(200).json({ data: sampleData, message: `Successfully provide SudoryWebhook result` });

      //for development purpose only END


      const serviceUuid = req.params.serviceUuid;
      const resultSudoryWebhook: object = await this.executorService.getSudoryWebhook(serviceUuid);
      if (!resultSudoryWebhook) {
        res.status(404).json({ data: resultSudoryWebhook, message: `no sudoryWebhook result` });
        return;
      }
      res.status(200).json({ Data: resultSudoryWebhook, message: `Successfully provide SudoryWebhook result` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public executeService = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      let name = req.body.name;
      let summary = req.body.summary;
      let clusterUuid = req.body.clusterUuid;
      let templateUuid = req.body.templateUuid;
      let steps = req.body.steps;

      const serviceOutput: any = await this.executorService.postExecuteService(name, summary, clusterUuid, templateUuid, steps);
      if (!serviceOutput) res.status(404).json({ data: serviceOutput, message: `Unable to process request` });
      res.status(200).json({ Data: serviceOutput, message: `Execution Successful.` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
   public syncMetricReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const customerAccountKey = req.customerAccountKey; 
      
      const serviceOutput: any = await this.executorService.syncMetricReceived(clusterUuid, customerAccountKey);
      if (!serviceOutput) res.status(404).json({ data: serviceOutput, message: `Unable to process request` });
      res.status(200).json({ Data: serviceOutput, message: `Sync metric Successful.` });
    } catch (error) {
      next(error);
    }
  };

} // end of class

export default executorController;
