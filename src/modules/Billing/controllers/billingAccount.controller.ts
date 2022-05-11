import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { IMetricMeta } from '@/common/interfaces/metricMeta.interface';
import { BillingAccountDto } from '../dtos/billingAccount.dto';
import BillingAccountService from '../services/billingAccount.service';
import { IBillingAccount } from '@/common/interfaces/billingAccount.interface';

class BillingAccountController {
  public billingAccountService = new BillingAccountService();

  public getBillingAccount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const allBillingAccount: IBillingAccount[] = await this.billingAccountService.getBillingAccount();
      res.status(200).json({ data: allBillingAccount, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public deleteBillingAccount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const billingAccountId: string = req.params.billingAccountId;
      const customerAccountKey = req.customerAccountKey;
      const deletedFlag = await this.billingAccountService.deleteBillingAccount(customerAccountKey, billingAccountId);
      if (deletedFlag) {
        res.status(200).json({ data: deletedFlag, message: 'deleted' });
      } else {
        res.status(204).json({ data: deletedFlag, message: 'No Content' });
      }
    } catch (error) {
      next(error);
    }
  };

  public createBillingAccount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const {
        user: { partyId },
      } = req;
      const billingAccountData: BillingAccountDto = req.body;
      const createBillingAccount: IBillingAccount = await this.billingAccountService.createBillingAccount(
        billingAccountData,
        customerAccountKey,
        partyId,
      );
      res.status(201).json({ data: createBillingAccount, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateBillingAccount = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const billingAccountId: string = req.params.billingAccountId;
      const {
        user: { partyId },
      } = req;
      const billingAccountData: BillingAccountDto = req.body;
      const customerAccountKey: number = req.customerAccountKey;
      const updateBillingAccountData: IBillingAccount = await this.billingAccountService.updateBillingAccountById(
        billingAccountId,
        billingAccountData,
        customerAccountKey,
        partyId,
      );
      res.status(200).json({ data: updateBillingAccountData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default BillingAccountController;
