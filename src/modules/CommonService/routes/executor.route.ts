import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import {
  ExecutorResourceDto,
  ExecutorDto,
  ExecutorKpsDto,
  ExecutorResourceListDto,
  ExecutorUuidDto,
  SudoryWebhookDto,
} from '@modules/CommonService/dtos/executor.dto';
import ResourceGroupController from '@modules/Resources/controllers/resourceGroup.controller';
import executorController from '@modules/CommonService/controllers/executor.controller';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class ExecutorRoute implements Routes {
  public router = Router();
  public resourceGroupController = new ResourceGroupController();
  public executorController = new executorController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/executor/resourcelist',
      authMiddleware,
      validationMiddleware(ExecutorResourceListDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.requestResourceToExecutor,
    );
    this.router.post(
      '/executor/resource',
      authMiddleware,
      validationMiddleware(ExecutorResourceDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleResource,
    );

    this.router.post(
      '/executor',
      authMiddleware,
      validationMiddleware(ExecutorDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.registerExecutorClient,
    );
    this.router.post(
      '/executor/kpsInstall',
      authMiddleware,
      validationMiddleware(ExecutorKpsDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.installKpsOnResourceGroup,
    );
    this.router.post(
      '/executor/metricReceived',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleMetricReceived,
    );
    this.router.post(
      '/executor/metric',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleMetricMeta,
    );
    this.router.post(
      '/executor/alert',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleAlert,
    );
    this.router.post(
      '/executor/syncMetricReceived',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.syncMetricReceived,
    );
    this.router.post(
      '/executor/sudorywebhook',
      systemAuthMiddleware,
      //validationMiddleware(SudoryWebhookDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.processSudoryWebhook,
    );
    this.router.post(
      '/executor/server/service',
      authMiddleware,
      //      createUserLogMiddleware,
      this.executorController.executeService,
    );
    this.router.get(
      '/executor/service/:serviceUuid',
      authMiddleware,
      //      createUserLogMiddleware,
      this.executorController.checkExecutorResponse,
    );
    this.router.get(
      '/executor/:clusterUuid',
      authMiddleware,
      //     createUserLogMiddleware,
      this.executorController.checkExecutorClient,
    );
    this.router.get(
      '/executor/sudorywebhook/:serviceUuid',
      authMiddleware,
      //     createUserLogMiddleware,
      this.executorController.getSudoryWebhook,
    );
  }
}

export default ExecutorRoute;
