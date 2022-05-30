import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import BayesianModelController  from '../controllers/bayesianModel.controller';
import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';
import { UpdateNotificationDto } from '@/modules/Notification/dtos/notification.dto';

class BayesianModelRoute implements Routes {
  public router = Router();
  public bayesianModelController = new BayesianModelController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/bayesianModel',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(CreateBayesianModelDto, 'body'),
      this.bayesianModelController.createBayesianModel,
    );
    this.router.get('/bayesianModels', authMiddleware, createUserLogMiddleware,  this.bayesianModelController.getAllBayesianModel);
    this.router.get('/bayesianModel/:bayesianModelId', authMiddleware, createUserLogMiddleware,  this.bayesianModelController.getBayesianModelById);
    this.router.put(
      '/bayesianModel/:bayesianModelId',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(UpdateBayesianModelDto, 'body'),
      this.bayesianModelController.updateBayesianModel,
    );
    this.router.put(
      '/bayesianModel/:bayesianModelId',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(UpdateBayesianModelDto, 'body'),
      this.bayesianModelController.updateBayesianModel,
    );
    this.router.put(
      '/bayesianModel/attachRuleGroup',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(UpdateBayesianModelDto, 'body'),
      this.bayesianModelController.updateBayesianModel,
    );
    this.router.put(
      '/bayesianModel/detachRuleGroup',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(UpdateBayesianModelDto, 'body'),
      this.bayesianModelController.updateBayesianModel,
    );
  }
}

export default BayesianModelRoute;
