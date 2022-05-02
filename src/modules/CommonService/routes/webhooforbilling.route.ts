import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import webhookForBillingController from '@/modules/CommonService/controllers/webhookforbilling.controller';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';


class webhookForBillingRoute implements Routes {
  public router = Router();
  public webhookForBillingController = new webhookForBillingController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/webhookforbilling', authMiddleware, this.webhookForBillingController.receiveBillingInterface);
  }
}

export default webhookForBillingRoute;