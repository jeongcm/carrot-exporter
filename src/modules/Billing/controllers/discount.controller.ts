import { NextFunction, Response } from 'express';
import { IDiscount } from '@/common/interfaces/discount.interface';
import DiscountService from '../services/discount.service';
import { DiscountDto } from '../dtos/discount.dto';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

class DiscountController {
  public discountService = new DiscountService();

  public createDiscount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const discountData: DiscountDto = req.body;
      const currentUserId = req?.user?.partyId;
      const createDiscountData: IDiscount = await this.discountService.createDiscount(discountData, currentUserId);

      const {
        discountId,
        createdBy,
        createdAt,
        discountName,
        discountDescription,
        discountBillingSolutionCode,
        discountType,
        discountValue,
        discountCurrency,
        discountRecurringType,
        discountFrom,
        discountTo,
      } = createDiscountData;

      const response = {
        discountId,
        createdBy,
        createdAt,
        discountName,
        discountDescription,
        discountBillingSolutionCode,
        discountType,
        discountValue,
        discountCurrency,
        discountRecurringType,
        discountFrom,
        discountTo,
      };

      res.status(201).json({ data: response, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllDiscount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllDiscountData: IDiscount[] = await this.discountService.getAllDiscount();

      res.status(200).json({ data: findAllDiscountData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getDiscountById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const discountId = req.params.discountId;

    try {
      const discount: IDiscount = await this.discountService.getDiscountById(discountId);
      res.status(200).json({ data: discount, message: `find discount id(${discountId}) ` });
    } catch (error) {
      next(error);
    }
  };

  public updateDiscountById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const discountId = req.params.discountId;
      const discountData = req.body;
      const currentUserId = req?.user?.partyId;

      const updateDiscountData: IDiscount = await this.discountService.updateDiscountById(discountId, discountData, currentUserId);

      res.status(200).json({ data: updateDiscountData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteDiscount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const discountId: string = req.params.discountId;

      const deletedDiscount = await this.discountService.deleteDiscount(discountId);
      if (deletedDiscount) {
        res.status(200).json({ data: deletedDiscount, message: 'deleted' });
      } else {
        res.status(204).json({ data: deletedDiscount, message: 'No Content' });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default DiscountController;
