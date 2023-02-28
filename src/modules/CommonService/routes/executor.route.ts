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
      '/executor/schedule/resource',
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
      '/executor/schedule/metricReceived',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleMetricReceived,
    );
    this.router.post(
      '/executor/schedule/metricMeta',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleMetricMeta,
    );
    this.router.post(
      '/executor/schedule/alert',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleAlert,
    );
    this.router.post(
      '/executor/syncMetricReceived',
      systemAuthMiddleware,
      //validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.syncMetricReceived,
    );
    this.router.post(
      '/executor/syncResources',
      systemAuthMiddleware,
      //validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.syncResources,
    );

    this.router.post(
      '/executor/syncAlerts',
      systemAuthMiddleware,
      //validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.syncAlerts,
    );
    this.router.post(
      '/executor/syncMetricMeta',
      systemAuthMiddleware,
      //validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.syncMetricMeta,
    );
    this.router.post(
      '/executor/schedule/syncMetricReceived',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleSyncMetricReceived,
    );
    this.router.post(
      '/executor/schedule/syncResources',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleSyncResources,
    );
    this.router.post(
      '/executor/schedule/syncAlerts',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleSyncAlerts,
    );
    this.router.post(
      '/executor/schedule/syncMetricMeta',
      authMiddleware,
      validationMiddleware(ExecutorUuidDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.scheduleSyncMetricMeta,
    );
    this.router.post(
      '/executor/sudorywebhook',
      systemAuthMiddleware,
      //validationMiddleware(SudoryWebhookDto, 'body'),
      //      createUserLogMiddleware,
      this.executorController.processSudoryWebhook,
    );
    this.router.get(
      '/executor/sudorywebhook/:serviceUuid',
      authMiddleware,
      //     createUserLogMiddleware,
      this.executorController.getSudoryWebhook,
    );
    this.router.post(
      '/executor/server/service',
      authMiddleware,
      //      createUserLogMiddleware,
      this.executorController.executeService,
    );
    this.router.post(
      '/executor/server/service/v2',
      authMiddleware,
      //      createUserLogMiddleware,
      this.executorController.executeServiceV2,
    );
    this.router.get(
      '/executor/server/service/:executorServiceId',
      authMiddleware,
      //      createUserLogMiddleware,
      this.executorController.getExecuteServicebyExecutorServiceId,
    );
    this.router.get(
      '/executor/server/service/customerAccount/:customerAccountId',
      authMiddleware,
      //      createUserLogMiddleware,
      this.executorController.getExecuteServicebyCustomerAccountId,
    );
    this.router.post(
      '/executor/service/metric',
      authMiddleware,
      //      createUserLogMiddleware,
      this.executorController.postMetricRequest,
    );

    this.router.get(
      '/executor/service/:serviceUuid',
      authMiddleware,
      //      createUserLogMiddleware,
      this.executorController.checkExecutorResponse,
    );

    this.router.get(
      '/executor/:platform/:clusterUuid/:sudoryNamespace',
      authMiddleware,
      //     createUserLogMiddleware,
      this.executorController.checkExecutorClient,
    );
  }
}

export default ExecutorRoute;
