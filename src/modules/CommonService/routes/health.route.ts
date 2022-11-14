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

import HealthController from '@modules/CommonService/controllers/health.controller';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class HealthRoute implements Routes {
  public router = Router();
  public healthController = new HealthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/health/customerAccount',
      //authMiddleware,
      //validationMiddleware(ExecutorResourceListDto, 'body'),
      //      createUserLogMiddleware,
      this.healthController.checkHealthByCustomerAccountId,
    );
  }
}

export default HealthRoute;
