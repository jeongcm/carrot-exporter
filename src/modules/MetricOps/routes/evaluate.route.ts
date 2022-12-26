import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import EvaluateController from '../controllers/evaluate.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { evaluateCustomerDto, evaluateMonitoringTargetDto } from '../dtos/evaluate.dto';

class EvaluateRoute implements Routes {
  public router = Router();
  public evaluateController = new EvaluateController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/evaluate/anomalyMonitoringTarget/',
      authMiddleware,
      //createUserLogMiddleware,
      validationMiddleware(evaluateMonitoringTargetDto, 'body'),
      this.evaluateController.evaluateMonitoringTarget,
    );

    this.router.post(
      '/evaluate/customerAccount/',
      //authMiddleware,
      //createUserLogMiddleware,
      //validationMiddleware(CreateBayesianModelDto, 'body'),
      this.evaluateController.initiateEvaluationProcess,
    );

    this.router.get(
      '/evaluate/:evaluationId',
      authMiddleware,
      //createUserLogMiddleware,
      validationMiddleware(evaluateCustomerDto, 'body'),
      this.evaluateController.getEvaluationHistoryById,
    );

    this.router.get(
      '/evaluate/customerAccount/:customerAccountId/:offset/:limit',
      authMiddleware,
      //createUserLogMiddleware,
      //validationMiddleware(CreateBayesianModelDto, 'body'),
      this.evaluateController.getEvaluationHistoryAll,
    );

    this.router.get(
      '/evaluate/anomalyMonitoringTaget/:anomalyMonitoringTargetId',
      authMiddleware,
      //createUserLogMiddleware,
      //validationMiddleware(CreateBayesianModelDto, 'body'),
      this.evaluateController.getEvaluationHistoryByTargetId,
    );
  }
}

export default EvaluateRoute;
