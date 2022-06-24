import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';

import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import SchedulerController from '@/modules/Scheduler/controllers/scheduler.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { SchedulerDto } from '../dtos/scheduler.dto';

class SchedulerRoute implements Routes {
  public router = Router();
  public schedulerController = new SchedulerController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/scheduler/account/:accountId', authMiddleware, this.schedulerController.getSchedulerByAccountId);
    this.router.post('/scheduler', authMiddleware, validationMiddleware(SchedulerDto, 'body'), this.schedulerController.createScheduler);
  }
}

export default SchedulerRoute;
