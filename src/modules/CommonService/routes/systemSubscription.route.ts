import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import SystemSubscriptionController from '@/modules/CommonService/controllers/systemSubscription.controller';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

class systemSubscription implements Routes {
  public router = Router();
  public systemSubscriptionController = new SystemSubscriptionController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/systemSubscription', systemAuthMiddleware, this.systemSubscriptionController.createSystemSubscription);
  }
}

export default systemSubscription;
