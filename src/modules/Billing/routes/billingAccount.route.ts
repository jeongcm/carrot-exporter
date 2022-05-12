import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import BillingAccountController from '../controllers/billingAccount.controller';
import { BillingAccountDto } from '../dtos/billingAccount.dto';

class BillingAccountRoute implements Routes {
  public router = Router();
  public billingAccountController = new BillingAccountController();
  // public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/billing/account',
      authMiddleware,
      validationMiddleware(BillingAccountDto, 'body'),
      this.billingAccountController.createBillingAccount,
    );
    this.router.get('/billing/account', authMiddleware, this.billingAccountController.getBillingAccount);
    this.router.put(
      '/billing/account/:billingAccountId',
      authMiddleware,
      validationMiddleware(BillingAccountDto, 'body'),
      this.billingAccountController.updateBillingAccount,
    );
    this.router.delete('/billing/account/:billingAccountId', authMiddleware, this.billingAccountController.deleteBillingAccount);
  }
}

export default BillingAccountRoute;
