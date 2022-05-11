import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import BillingAccountController from '../controllers/billingAccount.controller';
import { BillingAccountDto } from '../dtos/billingAccount.dto';
import PaymentTenderController from '../controllers/paymentTender.controller';
import { PaymentTenderDto } from '../dtos/paymentTender.dto';

class MetricRoute implements Routes {
  public router = Router();
  public paymentTenderController = new PaymentTenderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/payment/tender',
      authMiddleware,
      validationMiddleware(PaymentTenderDto, 'body'),
      this.paymentTenderController.createPaymentTender,
    );
    this.router.get('/payment/tender', authMiddleware, this.paymentTenderController.getPaymentTender);
  }
}

export default MetricRoute;
