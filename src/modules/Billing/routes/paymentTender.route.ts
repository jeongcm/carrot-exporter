import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import PaymentTenderController from '../controllers/paymentTender.controller';
import { PaymentTenderDto } from '../dtos/paymentTender.dto';

class PaymentTenderRoute implements Routes {
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
      this.paymentTenderController.createPaymentTender
    );
    this.router.get('/payment/tender', authMiddleware, this.paymentTenderController.getPaymentTender);
    this.router.get('/payment/tender/:paymentTenderId', authMiddleware, this.paymentTenderController.getPaymentTenderById);
    this.router.put(
      '/payment/tender/:paymentTenderId',
      authMiddleware,
      validationMiddleware(PaymentTenderDto, 'body'),
      this.paymentTenderController.updatePaymentTenderById
    );
    this.router.delete('/payment/tender/:paymentTenderId', authMiddleware, this.paymentTenderController.deletePaymentTender);
  }
}

export default PaymentTenderRoute;
