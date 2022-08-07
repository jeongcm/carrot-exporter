import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import EvaluateController  from '../controllers/evaluate.controller';
import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';
import { AttachRuleGroupDto, DetachRuleGroupDto, UpdateAttachRuleGroupDto } from '../dtos/modelRuleScore.dto';

class EvaluateRoute implements Routes {
  public router = Router();
  public evaluateController = new EvaluateController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/evaluate/resource/',
      authMiddleware,
      //createUserLogMiddleware,
      //validationMiddleware(CreateBayesianModelDto, 'body'),
      this.evaluateController.evaluateMonitoringTarget,
    );

    this.router.post(
      '/evaluate/customerAccount/',
      authMiddleware,
      //createUserLogMiddleware,
      //validationMiddleware(CreateBayesianModelDto, 'body'),
      this.evaluateController.initiateEvaluationProcess,
    );    

    this.router.get(
      '/evaluate/:evaluationId',
      authMiddleware,
      //createUserLogMiddleware,
      //validationMiddleware(CreateBayesianModelDto, 'body'),
      this.evaluateController.getEvaluationHistoryById,
    );    

    this.router.get(
      '/evaluate/customerAccount/:customerAccountId',
      authMiddleware,
      //createUserLogMiddleware,
      //validationMiddleware(CreateBayesianModelDto, 'body'),
      this.evaluateController.getEvaluationHistoryAll,
    );    

  }
}

export default EvaluateRoute;
