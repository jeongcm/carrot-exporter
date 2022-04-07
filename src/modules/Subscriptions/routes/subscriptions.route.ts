import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import SubscriptionController from '@/modules/Subscriptions/controllers/subscriptions.controller';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { CreateSubscriptionDto } from '@/modules/Subscriptions/dtos/subscriptions.dto';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class SubscriptionRoute implements Routes {
  public router = Router();
  public subscriptionController = new SubscriptionController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/subscription', authMiddleware, validationMiddleware(CreateSubscriptionDto, 'body'), this.subscriptionController.createSubscriptions);
    this.router.get('/subscriptions', authMiddleware, this.subscriptionController.getAllSubscriptions);
    this.router.get('/subscription/:subscriptionId', authMiddleware, this.subscriptionController.findSubscription);
    this.router.put('/subscription/:subscriptionId', authMiddleware, validationMiddleware(CreateSubscriptionDto, 'body'), this.subscriptionController.updateSubscription);
  }
}

export default SubscriptionRoute;