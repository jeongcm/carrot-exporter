import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import webhookForBillingController from '@/modules/CommonService/controllers/webhookforbilling.controller';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class webhookForBillingRoute implements Routes {
  public router = Router();
  public webhookForBillingController = new webhookForBillingController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/webhookforbilling', authMiddleware, createUserLogMiddleware, this.webhookForBillingController.receiveBillingInterface);
  }
}

export default webhookForBillingRoute;
