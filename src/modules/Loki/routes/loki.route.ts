import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import LokiController from '../controllers/loki.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class LokiRoute implements Routes {
  public router = Router();
  public lokiController = new LokiController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/loki/v1/tail', authMiddleware, createUserLogMiddleware, this.lokiController.tailLog);
  }
}

export default LokiRoute;
