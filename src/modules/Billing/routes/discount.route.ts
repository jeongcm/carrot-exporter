import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { DiscountDto } from '../dtos/discount.dto';
import DiscountController from '../controllers/discount.controller';

class DiscountRoute implements Routes {
  public router = Router();
  public discountController = new DiscountController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/discount', authMiddleware, validationMiddleware(DiscountDto, 'body'), this.discountController.createDiscount);
    this.router.get('/discount', authMiddleware, this.discountController.getAllDiscount);
    this.router.get('/discount/:discountId', authMiddleware, this.discountController.getDiscountById);
    this.router.put('/discount/:discountId', authMiddleware, validationMiddleware(DiscountDto, 'body'), this.discountController.updateDiscountById);
    this.router.delete('/discount/:discountId', authMiddleware, this.discountController.deleteDiscount);
  }
}

export default DiscountRoute;
