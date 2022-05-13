import DB from '@/database';
import { ICoupon } from '@/common/interfaces/coupon.interface';
import { IDiscount } from '@/common/interfaces/discount.interface';
import { CouponDto } from '../dtos/coupon.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
const { Op } = require('sequelize');

class CouponService {
  public coupon = DB.Coupon;
  public discount = DB.Discount;
  public tableIdService = new tableIdService();

  public async createCoupon(couponData: CouponDto, partyId: string): Promise<ICoupon> {
    if (isEmpty(couponData)) throw new HttpException(400, 'Coupon  must not be empty');
    const currentDiscount: IDiscount = await this.discount.findOne({ where: { discountId: couponData.discountId } });

    if (!currentDiscount) {
      throw new HttpException(400, 'discountId not found');
    }

    try {
      const tableIdTableName = 'Coupon';
      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return;
      }

      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createCoupon: ICoupon = await this.coupon.create({
        couponId: responseTableIdData.tableIdFinalIssued,
        createdBy: partyId,
        discountKey: currentDiscount.discountKey,
        ...couponData,
      });

      return createCoupon;
    } catch (error) {}
  }

  public async getAllCoupon(): Promise<ICoupon[]> {
    const allCoupon: ICoupon[] = await this.coupon.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['couponKey', 'deletedAt'] },
    });

    return allCoupon;
  }

  public async getCouponById(couponId: string): Promise<ICoupon> {
    const coupon: ICoupon = await this.coupon.findOne({
      where: { couponId, deletedAt: null },
      attributes: { exclude: ['couponKey', 'deletedAt'] },
    });

    return coupon;
  }

  public async updateCouponById(couponId: string, couponData: CouponDto, partyId: string): Promise<ICoupon> {
    if (isEmpty(couponData)) throw new HttpException(400, 'Coupon  must not be empty');

    const findCoupon: ICoupon = await this.coupon.findOne({ where: { couponId: couponId } });

    if (!findCoupon) throw new HttpException(400, "Coupon  doesn't exist");

    const updatedCoupon = {
      ...couponData,
      updatedBy: partyId,
      updatedAt: new Date()
    };

    await this.coupon.update(updatedCoupon, { where: { couponId: couponId } });

    return this.getCouponById(couponId);
  }

  public async deleteCoupon(couponId: string) {
    try {
      const deleteCouponData = {
        deletedAt: new Date(),
      };

      const result = await this.coupon.update(deleteCouponData, {
        where: {
          couponId: couponId,
          deletedAt: {
            [Op.eq]: null,
          },
        },
      });
      if (result[0] == 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

export default CouponService;
