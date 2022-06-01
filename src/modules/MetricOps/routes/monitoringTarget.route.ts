import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import AnomalyMonitoringTargetController  from '../controllers/monitoringTarget.controller';
import ModelRuleScoreController  from '../controllers/modelRuleScore.controller';
import { CreateMonitoringTargetDto, UpdateMonitoringTargetDto } from '../dtos/monitoringTarget.dto';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class AnomalyMonitoringTargetRoute implements Routes {
  public router = Router();
  public anomalyMonitoringTargetController = new AnomalyMonitoringTargetController();
  public modelRuleScoreController = new ModelRuleScoreController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/registerTarget',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(CreateMonitoringTargetDto, 'body'),
      this.anomalyMonitoringTargetController.createMonitoringTarget,
    );
    this.router.get('/allTargets', authMiddleware, createUserLogMiddleware,  this.anomalyMonitoringTargetController.getAllMonitoringTarget);
    this.router.get('/target/:anomalyMonitoringTargetId', authMiddleware, createUserLogMiddleware,  this.anomalyMonitoringTargetController.getMonitoringTargetById);
    this.router.put(
      '/target/:anomalyMonitoringTargetId',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(UpdateMonitoringTargetDto, 'body'),
      this.anomalyMonitoringTargetController.updateMonitoringTarget,
    );
  }
}


export default AnomalyMonitoringTargetRoute;