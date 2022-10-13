import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { ISudoryWebhook } from '@/common/interfaces/sudoryWebhook.interface';

import { ExecutorDto, IExecutorClient, IExecutorClientCheck } from '@/modules/CommonService/dtos/executor.dto';

import executorService from '../services/executor.service';
import { HttpException } from '@/common/exceptions/HttpException';
import config from '@config/index';

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
      const sudoryNamespace = req.params.sudoryNamespace;
      const customerAccountKey = req.customerAccountKey;

      const clientResponse = await this.executorService.checkExecutorClient(clusterUuid, sudoryNamespace, customerAccountKey);

      if (clientResponse) {
        res.status(200).json({ data: clientResponse, message: `Success to confirm Executor/Sudory client` });
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

      const serviceUuids = await this.executorService.installKpsOnResourceGroup(clusterUuid, customerAccountKey, targetNamespace, systemId);
      res
        .status(200)
        .json({ serviceUuid: serviceUuids, message: `Successfullyt submit kps stack installation service request on cluserUuid: ${clusterUuid}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public installKpsOnResourceGroupForOpenstack = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const targetNamespace = req.body.targetNamespace;
      const customerAccountKey = req.customerAccountKey;
      const systemId = req.systemId;

      const serviceUuids = await this.executorService.installKpsOnResourceGroupForOpenstack(clusterUuid, customerAccountKey, targetNamespace, systemId);
      res
        .status(200)
        .json({ serviceUuid: serviceUuids, message: `Successfullyt submit kps stack installation service request on cluserUuid: ${clusterUuid}` });
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

      const cronJobKey = await this.executorService.scheduleMetricMeta(clusterUuid, customerAccountKey);
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
      const cronJobKey = await this.executorService.scheduleAlert(clusterUuid, customerAccountKey);
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
  public scheduleSyncMetricReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const cronTab = req.body.cronTab || config.metricReceivedCron;
      //const targetNamespace = req.body.targetNamespace;
      //const customerAccountKey = req.customerAccountKey;

      const cronJobKey: object = await this.executorService.scheduleSyncMetricReceived(clusterUuid, cronTab);
      res.status(200).json({ cronJobKey: cronJobKey, message: `Successfullyt schedule metric received sync jobs` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public scheduleSyncResources = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const cronTab = req.body.cronTab || config.resourceCron;

      const cronJobKey: object = await this.executorService.scheduleSyncResources(clusterUuid, cronTab);
      res.status(200).json({ cronJobKey: cronJobKey, message: `Successfullyt schedule resource sync jobs` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public scheduleSyncAlerts = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const cronTab = req.body.cronTab || config.alertCron;

      const cronJobKey: object = await this.executorService.scheduleSyncAlerts(clusterUuid, cronTab);
      res.status(200).json({ cronJobKey: cronJobKey, message: `Successfullyt schedule alert sync jobs` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public scheduleSyncMetricMeta = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const cronTab = req.body.cronTab || config.metricCron;

      const cronJobKey: object = await this.executorService.scheduleSyncMetricMeta(clusterUuid, cronTab);
      res.status(200).json({ cronJobKey: cronJobKey, message: `Successfullyt schedule MetricMeta sync jobs` });
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

      const cronJobKey = await this.executorService.scheduleResource(clusterUuid, customerAccountKey, resourceType, cronTab);
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

      const service_uuid = req.body.service_uuid;
      const status = req.body.status;
      console.log(req.body);
      const resultSudoryWebhook: object = await this.executorService.processSudoryWebhook(req.body);

      res
        .status(200)
        .json({ data: resultSudoryWebhook, message: `Successfully process SudoryWebhook - service_uuid: ${service_uuid}, -status: ${status}` });
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
      const serviceUuid = req.params.serviceUuid;
      console.log(serviceUuid);
      const resultSudoryWebhook: ISudoryWebhook = await this.executorService.getSudoryWebhook(serviceUuid);
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
      const name = req.body.name;
      const summary = req.body.summary;
      const clusterUuid = req.body.clusterUuid;
      const templateUuid = req.body.templateUuid;
      const steps = req.body.steps;
      const customerAccountKey = req.customerAccountKey;
      const subscribed_channel = req.body.subscribed_channel || config.sudoryApiDetail.channel_webhook;

      const serviceOutput: any = await this.executorService.postExecuteService(
        name,
        summary,
        clusterUuid,
        templateUuid,
        steps,
        customerAccountKey,
        subscribed_channel,
      );
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
      const cronTab = req.body.cronTab || config.metricReceivedCron;

      const serviceOutput: any = await this.executorService.syncMetricReceived(clusterUuid, cronTab);
      if (!serviceOutput) res.status(404).json({ data: serviceOutput, message: `Unable to process request` });
      res.status(200).json({ Data: serviceOutput, message: `Sync metric Successful.` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public syncResources = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const cronTab = req.body.cronTab || config.resourceCron;

      const serviceOutput: any = await this.executorService.syncResources(clusterUuid, cronTab);
      if (!serviceOutput) res.status(404).json({ data: serviceOutput, message: `Unable to process request` });
      res.status(200).json({ Data: serviceOutput, message: `Sync resource Successful. ${clusterUuid}, ${cronTab}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public syncAlerts = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const cronTab = req.body.cronTab || config.alertCron;

      const serviceOutput: any = await this.executorService.syncAlerts(clusterUuid, cronTab);
      if (!serviceOutput) res.status(404).json({ data: serviceOutput, message: `Unable to process request` });
      res.status(200).json({ Data: serviceOutput, message: `Sync Alert Successful. ${clusterUuid}, ${cronTab}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public syncMetricMeta = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const cronTab = req.body.cronTab || config.metricCron;

      const serviceOutput: any = await this.executorService.syncMetricMeta(clusterUuid, cronTab);
      if (!serviceOutput) res.status(404).json({ data: serviceOutput, message: `Unable to process request` });
      res.status(200).json({ Data: serviceOutput, message: `Sync MetricMeta Successful. ${clusterUuid}, ${cronTab}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public postMetricRequest = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.body.clusterUuid;
      const queryType = req.body.queryType;
      const steps = req.body.stepQuery;
      const customerAccountKey = req.customerAccountKey;
      const serviceOutput: any = await this.executorService.postMetricRequest(clusterUuid, queryType, steps, customerAccountKey);

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
  public getExecuteServicebyExecutorServiceId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const executorServiceId = req.params.executorServiceId;
      const executorService: any = await this.executorService.getExecutorServicebyExecutorServiceId(executorServiceId);

      if (!executorService) res.status(404).json({ data: executorService, message: `not found executorService` });
      res.status(200).json({ Data: executorService, message: `Found executorService` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getExecuteServicebyCustomerAccountId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountId = req.params.customerAccountId;
      const executorService: any = await this.executorService.getExecutorServicebyCustomerAccountId(customerAccountId);

      if (!executorService) res.status(404).json({ data: executorService, message: `not found executorService` });
      res.status(200).json({ Data: executorService, message: `Found executorService` });
    } catch (error) {
      next(error);
    }
  };
} // end of class

export default executorController;
