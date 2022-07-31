import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import EvaluateService from '../services/evaluate.service';
import { IBayesianDBModel, IBayesianModel } from '@/common/interfaces/bayesianModel.interface';

class EvaluateController {
    public evaluateService = new EvaluateService();

    public evaluateMonitoringTarget = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
          const resourceKey = parseInt(req.body.resourceKey);
          const evalatiaonDetails = await this.evaluateService.evaluateMonitoringTarget(resourceKey);
          res.status(200).json({ data: evalatiaonDetails, message: `Evaluation complate - ${resourceKey}` });
        } catch (error) {
          next(error);
        }
      };

}

export default EvaluateController;