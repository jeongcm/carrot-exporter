import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { IMetricMeta } from '@/common/interfaces/metricMeta.interface';
import BillingAccountService from '../services/billingAccount.service';
import { IBillingAccount } from '@/common/interfaces/billingAccount.interface';
import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import BayesianModelService from '../services/bayesianModel.service';
import { IBayesianModel } from '@/common/interfaces/bayesianModel.interface';
import { updateTenancyMemberDto } from '@/modules/UserTenancy/dtos/tenancyMember.dto';

class BayesianModelController {
  public bayesianModelService = new BayesianModelService();

  public getAllBayesianModel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const bayesianModelList: IBayesianModel[] = await this.bayesianModelService.findAllBayesianModel(customerAccountKey);
      res.status(200).json({ data: bayesianModelList, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  // public deleteBayesianModel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const billingAccountId: string = req.params.billingAccountId;
  //     const customerAccountKey = req.customerAccountKey;
  //     const deletedFlag = await this.billingAccountService.deleteBillingAccount(customerAccountKey, billingAccountId);
  //     if (deletedFlag) {
  //       res.status(200).json({ data: deletedFlag, message: 'deleted' });
  //     } else {
  //       res.status(204).json({ data: deletedFlag, message: 'No Content' });
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public createBayesianModel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId } = {},
        systemId,
        customerAccountKey
      } = req;
      console.log("customerAccountKey", customerAccountKey)
      const bayesianModelData: CreateBayesianModelDto = req.body;
      const newBayesianModel: IBayesianModel = await this.bayesianModelService.createBayesianModel(
        bayesianModelData,
        customerAccountKey,
        systemId || partyId,
      );
      res.status(201).json({ data: newBayesianModel, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateBayesianModel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId } = {},
        params: { bayesianModelId } = {}
      } = req;
      const bayesianModelData: UpdateBayesianModelDto = req.body;
      const customerAccountKey: number = req.customerAccountKey;
      const updateBayesianModelData: IBayesianModel = await this.bayesianModelService.updateBayesianModel(
        bayesianModelId,
        bayesianModelData,
        partyId,
      );
      res.status(200).json({ data: updateBayesianModelData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getBayesianModelById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
        params: { bayesianModelId }
      } = req;
      const bayesianModelData: IBayesianModel = await this.bayesianModelService.findBayesianModelById(
        bayesianModelId
      );
      res.status(200).json({ data: bayesianModelData, message: 'find' });
    } catch (error) {
      next(error);
    }
  };
}

export default BayesianModelController;
