import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { BillingAccountDto } from '../dtos/billingAccount.dto';
import BillingAccountDiscountController from '../controllers/billingAccountDiscount.controller';
import { BillingAccountDiscountDto } from '../dtos/billingAccountDiscount.dto';

class BillingAccountDiscountRoute implements Routes {
  public router = Router();
  public billingAccountDiscountController = new BillingAccountDiscountController()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/billing/account/discount',
      authMiddleware,
      validationMiddleware(BillingAccountDiscountDto, 'body'),
      this.billingAccountDiscountController.createBillingAccountDiscount,
    );
    this.router.get('/billing/account/discount', authMiddleware, this.billingAccountDiscountController.getBillingAccountDiscount);
    this.router.put(
      '/billing/account/discount/:billingAccountDiscountId',
      authMiddleware,
      validationMiddleware(BillingAccountDiscountDto, 'body'),
      this.billingAccountDiscountController.updateBillingAccountDiscount,
    );
    this.router.delete('/billing/account/discount/:billingAccountDiscountId', authMiddleware, this.billingAccountDiscountController.deleteBillingAccountDiscount);
  }
}

export default BillingAccountDiscountRoute;
