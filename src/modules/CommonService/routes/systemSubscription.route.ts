import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import SystemSubscriptionController from '@/modules/CommonService/controllers/systemSubscription.controller';
import AuthService from '@/modules/UserTenancy/services/auth.service';

import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';



class systemSubscription implements Routes {
  public router = Router();
  public systemSubscriptionController = new SystemSubscriptionController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/systemSubscription',systemAuthMiddleware,this.systemSubscriptionController.createSystemSubscription);
  }
}

export default systemSubscription;