import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import EvaluateService from '../services/evaluate.service';
import { IBayesianDBModel, IBayesianModel } from '@/common/interfaces/bayesianModel.interface';
import { logger } from '@/common/utils/logger';

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

  public initiateEvaluationProcess = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountId = req.body.customerAccountId;
      const logginedUserId = 'PU24060400000024' || req.user?.partyId;
      const evalatiaonResult = await this.evaluateService.initiateEvaluationProcess(customerAccountId, logginedUserId);
      res.status(200).json({ data: evalatiaonResult, message: `Evaluation complate - ${customerAccountId}` });
    } catch (error) {
      next(error);
    }
  };

  public getEvaluationHistoryById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const evaluationId = req.params.evaluationId;
      const evalatiaonResult = await this.evaluateService.getEvaluationHistoryById(evaluationId);
      res.status(200).json({ data: evalatiaonResult, message: `Evaluation result by Id - ${evaluationId}` });
    } catch (error) {
      next(error);
    }
  };

  public getEvaluationHistoryAll = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountId = req.params.customerAccountId;
      const limit = parseInt(req.params.limit) || 500;
      const offset = parseInt(req.params.offset) || 0;
      const evalatiaonResult = await this.evaluateService.getEvaluationHistoryAll(customerAccountId, limit, offset);
      res.status(200).json({ data: evalatiaonResult, message: `Evaluation result by customerAccountId - ${customerAccountId}` });
    } catch (error) {
      next(error);
    }
  };

  public getEvaluationHistoryByTargetId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const anomalyMonitoringTargetId = req.params.anomalyMonitoringTargetId;
      const evalatiaonResult = await this.evaluateService.getEvaluationHistoryByTargetId(anomalyMonitoringTargetId);
      res.status(200).json({ data: evalatiaonResult, message: `Evaluation result by anomalyMonitoringTargetId - ${anomalyMonitoringTargetId}` });
    } catch (error) {
      next(error);
    }
  };
}

export default EvaluateController;
