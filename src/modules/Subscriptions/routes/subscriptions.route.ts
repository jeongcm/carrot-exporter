import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import SubscriptionController from '@/modules/Subscriptions/controllers/subscriptions.controller';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { CreateSubscribedProductDto, CreateSubscriptionDto, UpdateSubscriptionDto } from '@/modules/Subscriptions/dtos/subscriptions.dto';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

class SubscriptionRoute implements Routes {
  public router = Router();
  public subscriptionController = new SubscriptionController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/subscription', authMiddleware, validationMiddleware(CreateSubscriptionDto, 'body'), createUserLogMiddleware,  this.subscriptionController.createSubscriptions);
    this.router.get('/subscriptions', authMiddleware, createUserLogMiddleware, this.subscriptionController.getAllSubscriptions);
    this.router.get('/subscription/:subscriptionId', authMiddleware, createUserLogMiddleware, this.subscriptionController.findSubscription);
    this.router.put('/subscription/:subscriptionId', authMiddleware, validationMiddleware(UpdateSubscriptionDto, 'body'), createUserLogMiddleware, this.subscriptionController.updateSubscription);
    this.router.post('/subscribeProduct', authMiddleware, validationMiddleware(CreateSubscribedProductDto, 'body'), createUserLogMiddleware, this.subscriptionController.createSubscribeProduct)
    this.router.get('/subscribeProduct/:subscribedProductId', authMiddleware, createUserLogMiddleware, this.subscriptionController.getSubscribeProduct)
    this.router.put('/subscribeProduct/:subscribedProductId', authMiddleware, createUserLogMiddleware, this.subscriptionController.updateSubscribedProduct)
  }
}

export default SubscriptionRoute;