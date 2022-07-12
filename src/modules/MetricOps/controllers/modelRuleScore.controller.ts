import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { IMetricMeta } from '@/common/interfaces/metricMeta.interface';
import { IBillingAccount } from '@/common/interfaces/billingAccount.interface';
import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import ModelRuleScoreService from '../services/modelRuleScore.service';
import { IBayesianModel } from '@/common/interfaces/bayesianModel.interface';
import { updateTenancyMemberDto } from '@/modules/UserTenancy/dtos/tenancyMember.dto';
import { DetachRuleGroupDto, AttachRuleGroupDto } from '../dtos/modelRuleScore.dto';
import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';

class ModelRuleGroupController {
  public modelRuleScoreService= new ModelRuleScoreService();

  public attachRuleGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId } = {},
        systemId,
      } = req;
      const modelRuleScoreData: AttachRuleGroupDto = req.body;
      const newRuleGroupAdded: IModelRuleScore = await this.modelRuleScoreService.attachRuleGroup(
        modelRuleScoreData,
        systemId || partyId,
      );
      res.status(201).json({ data: newRuleGroupAdded, message: 'rule group added' });
    } catch (error) {
      next(error);
    }
  };
  public updateAttachRuleGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId } = {},
        systemId,
        params:{modelRuleScoreId= ""}
      } = req;
      const modelRuleScoreData: AttachRuleGroupDto = req.body;
      const newRuleGroupAdded: IModelRuleScore = await this.modelRuleScoreService.updateAttachRuleGroup(
        modelRuleScoreData,
        modelRuleScoreId,
        systemId || partyId,
      );
      res.status(201).json({ data: newRuleGroupAdded, message: 'rule group added' });
    } catch (error) {
      next(error);
    }
  };

  public detachRuleGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId } = {},
        body: { bayesianModelId, ruleGroupId } = {},
        systemId
      } = req;
      const isDetached: any = await this.modelRuleScoreService.detachRuleGroup(
        bayesianModelId,
        ruleGroupId,
        systemId||partyId
      );
      res.status(200).json({ message: 'Rule group detached successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getModelScoreByGroupId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params:{ruleGroupId = "", bayesianModelId= ""}
      } = req;
     
      const modelScoreDetail: IModelRuleScore = await this.modelRuleScoreService.getModelScoreByGroupId(
        ruleGroupId,
        bayesianModelId
      );
      res.status(200).json({ data: modelScoreDetail, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getAllModelsByGroupId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      console.log("getAllModelsByGroupId")
      const {
        params:{ruleGroupId = ""}
      } = req;
     
      const modelScoreDetail: IModelRuleScore = await this.modelRuleScoreService.getAllModelsByGroupId(
        ruleGroupId
      );
      res.status(200).json({ data: modelScoreDetail, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

 
}

export default ModelRuleGroupController;
