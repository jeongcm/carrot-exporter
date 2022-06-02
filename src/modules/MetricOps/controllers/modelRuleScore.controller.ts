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

  public detachRuleGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId } = {},
        params: { bayesianModelId } = {},
        systemId
      } = req;
      const modelRuleScoreData: DetachRuleGroupDto = req.body;
      const isDetached: Boolean = await this.modelRuleScoreService.detachRuleGroup(
        modelRuleScoreData,
        systemId||partyId
      );
      res.status(200).json({ message: 'Rule group detached successfully' });
    } catch (error) {
      next(error);
    }
  };

 
}

export default ModelRuleGroupController;
