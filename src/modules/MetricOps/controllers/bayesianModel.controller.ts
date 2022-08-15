import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import BayesianModelService from '../services/bayesianModel.service';
import { IBayesianDBModel, IBayesianModel } from '@/common/interfaces/bayesianModel.interface';

class BayesianModelController {
  public bayesianModelService = new BayesianModelService();

  public getAllBayesianModel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const bayesianModelClusterId = req?.query?.clusterId;
      const bayesianModelList: IBayesianDBModel[] = await this.bayesianModelService.findAllBayesianModel(customerAccountKey, bayesianModelClusterId);
      res.status(200).json({ data: bayesianModelList, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public deleteBayesianModel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const bayesianModelId: string = req.params.baysianModelId;
      const partyId = req.user.partyId;
      console.log(bayesianModelId);
      const deletedFlag = await this.bayesianModelService.deleteBayesianModel(bayesianModelId, partyId);
      if (deletedFlag) {
        res.status(200).json({ data: deletedFlag, message: 'deleted' });
      } else {
        res.status(204).json({ data: deletedFlag, message: 'No Content' });
      }
    } catch (error) {
      next(error);
    }
  };

  public createBayesianModel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { user: { partyId } = {}, systemId, customerAccountKey } = req;
      console.log('customerAccountKey', customerAccountKey);
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
      const { user: { partyId } = {}, params: { bayesianModelId } = {} } = req;
      const bayesianModelData: UpdateBayesianModelDto = req.body;
      const updateBayesianModelData: IBayesianDBModel = await this.bayesianModelService.updateBayesianModel(
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
        params: { bayesianModelId },
      } = req;
      const bayesianModelData: IBayesianDBModel = await this.bayesianModelService.findBayesianModelById(bayesianModelId);
      res.status(200).json({ data: bayesianModelData, message: 'find' });
    } catch (error) {
      next(error);
    }
  };
  public getBayesianModelByResourceType = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { resourceType },
      } = req;
      console.log('resourceType in params');
      const bayesianModelData: IBayesianModel[] = await this.bayesianModelService.findBayesianModelByResourceType(resourceType);
      res.status(200).json({ data: bayesianModelData, message: 'find', resourceType });
    } catch (error) {
      next(error);
    }
  };
}

export default BayesianModelController;
