import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { BillingAccountDiscountDto } from '../dtos/billingAccountDiscount.dto';
import BillingAccountDiscountService from '../services/billingAccountDiscount.service';
import { IBillingAccountDiscount } from '@/common/interfaces/billingAccountDiscount.interface';

class BillingAccountDiscountController {
  public billingAccountDiscountService = new BillingAccountDiscountService();

  public getBillingAccountDiscount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const allBillingAccountDiscount: IBillingAccountDiscount[] = await this.billingAccountDiscountService.getBillingAccountDiscount();
      res.status(200).json({ data: allBillingAccountDiscount, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public deleteBillingAccountDiscount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const billingAccountDiscountId: string = req.params.billingAccountDiscountId;
      const deletedFlag = await this.billingAccountDiscountService.deleteBillingAccountDiscount(billingAccountDiscountId);
      if (deletedFlag) {
        res.status(200).json({ data: deletedFlag, message: 'deleted' });
      } else {
        res.status(204).json({ data: deletedFlag, message: 'No Content' });
      }
    } catch (error) {
      next(error);
    }
  };

  public createBillingAccountDiscount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
      } = req;
      const billingAccountDiscountData: BillingAccountDiscountDto = req.body;
      const createBillingAccountDiscount: IBillingAccountDiscount = await this.billingAccountDiscountService.createBillingAccountDiscount(
        billingAccountDiscountData,
        partyId,
      );
      res.status(201).json({ data: createBillingAccountDiscount, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateBillingAccountDiscount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const billingAccountDiscountId: string = req.params.billingAccountDiscountId;
      const {
        user: { partyId },
      } = req;
      const billingAccountDiscountData: BillingAccountDiscountDto = req.body;
      const updateBillingAccountData: IBillingAccountDiscount = await this.billingAccountDiscountService.updateBillingAccountDiscountById(
        billingAccountDiscountId,
        billingAccountDiscountData,
        partyId,
      );
      res.status(200).json({ data: updateBillingAccountData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default BillingAccountDiscountController;
