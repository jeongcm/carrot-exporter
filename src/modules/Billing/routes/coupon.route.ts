import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { CouponDto } from '../dtos/coupon.dto';
import CouponController from '../controllers/coupon.controller';

class CouponRoute implements Routes {
  public router = Router();
  public couponController = new CouponController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/coupon', authMiddleware, validationMiddleware(CouponDto, 'body'), this.couponController.createCoupon);
    this.router.get('/coupon', authMiddleware, this.couponController.getAllCoupon);
    this.router.get('/coupon/:couponId', authMiddleware, this.couponController.getCouponById);
    this.router.put('/coupon/:couponId', authMiddleware, validationMiddleware(CouponDto, 'body'), this.couponController.updateCouponById);
    this.router.delete('/coupon/:couponId', authMiddleware, this.couponController.deleteCoupon);
  }
}

export default CouponRoute;
