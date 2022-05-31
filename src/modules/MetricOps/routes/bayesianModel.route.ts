import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import BayesianModelController  from '../controllers/bayesianModel.controller';
import ModelRuleScoreController  from '../controllers/modelRuleScore.controller';
import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';
import { AttachRuleGroupDto, DetachRuleGroupDto } from '../dtos/modelRuleScore.dto';

class BayesianModelRoute implements Routes {
  public router = Router();
  public bayesianModelController = new BayesianModelController();
  public modelRuleScoreController = new ModelRuleScoreController();
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
    this.router.post(
      '/bayesianModel/attachRuleGroup',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(AttachRuleGroupDto, 'body'),
      this.modelRuleScoreController.attachRuleGroup,
    );
    this.router.put(
      '/bayesianModel/detachRuleGroup',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(DetachRuleGroupDto, 'body'),
      this.modelRuleScoreController.detachRuleGroup,
    );
  }
}

export default BayesianModelRoute;
