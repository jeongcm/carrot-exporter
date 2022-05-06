import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { ExecutorResourceDto,  ExecutorDto, ExecutorKpsDto} from '@modules/CommonService/dtos/executor.dto';
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
      validationMiddleware(ExecutorResourceDto, 'body'),
//      createUserLogMiddleware,
      this.executorController.requestResourceToExecutor,
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
        '/executor/scheduleMetricMeta',
        authMiddleware,
        validationMiddleware(ExecutorKpsDto, 'body'),
  //      createUserLogMiddleware,
        this.executorController.scheduleMetricMeta,
      );
    this.router.get(
        '/executor/resource/:serviceUuid',
        authMiddleware,
  //      createUserLogMiddleware,
        this.executorController.checkExecutorResourceResponse
      );
    this.router.get(
        '/executor/service/:serviceUuid',
        authMiddleware,
  //      createUserLogMiddleware,
        this.executorController.checkExecutorResponse
      );

    this.router.get(
        '/executor/:clusterUuid', 
        authMiddleware, 
   //     createUserLogMiddleware, 
   this.executorController.checkExecutorClient);
  }
}

export default ExecutorRoute;
