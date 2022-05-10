import { NextFunction, Response } from 'express';
import { ICoupon } from '@/common/interfaces/coupon.interface';
import CouponService from '../services/coupon.service';
import { CouponDto } from '../dtos/coupon.dto';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

class CouponController {
  public couponService = new CouponService();

  public createCoupon = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const couponData: CouponDto = req.body;
      const currentUserId = req?.user?.partyId;
      const createCouponData: ICoupon = await this.couponService.createCoupon(couponData, currentUserId);

      const {
        couponId,
        discountKey,
        createdBy,
        createdAt,
        couponFrom,
        couponTo,
        couponCode,
        couponName,
      } = createCouponData;

      const response = {
        couponId,
        discountKey,
        createdBy,
        createdAt,
        couponFrom,
        couponTo,
        couponCode,
        couponName,
      };

      res.status(201).json({ data: response, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllCoupon = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllCouponData: ICoupon[] = await this.couponService.getAllCoupon();

      res.status(200).json({ data: findAllCouponData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getCouponById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const couponId = req.params.couponId;

    try {
      const coupon: ICoupon = await this.couponService.getCouponById(couponId);
      res.status(200).json({ data: coupon, message: `find coupon id(${couponId}) ` });
    } catch (error) {
      next(error);
    }
  };

  public updateCouponById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const couponId = req.params.couponId;
      const couponData = req.body;
      const currentUserId = req?.user?.partyId;

      const updateCouponData: ICoupon = await this.couponService.updateCouponById(couponId, couponData, currentUserId);

      res.status(200).json({ data: updateCouponData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteCoupon = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const couponId: string = req.params.couponId;

      const deletedCoupon = await this.couponService.deleteCoupon(couponId);
      if (deletedCoupon) {
        res.status(200).json({ data: deletedCoupon, message: 'deleted' });
      } else {
        res.status(204).json({ data: deletedCoupon, message: 'No Content' });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default CouponController;
