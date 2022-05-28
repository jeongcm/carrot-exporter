import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { IRuleGroupAlertRule } from '@/common/interfaces/ruleGroupAlertRule.interface';
import { NextFunction, Response } from 'express';
import { RuleGroupAlertRuleDto, UnRegisterRuleGroupAlertRuleDto } from '../dtos/ruleGroupAlertRule.dto';
import RuleGroupAlertRuleService from '../services/ruleGroupAlertRule.service';

class RuleGroupAlertRuleController {
  public ruleGroupAlertRuleService = new RuleGroupAlertRuleService();

  public registerAlertRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
      } = req;
      const ruleGroupAlertRuleData: RuleGroupAlertRuleDto = req.body;
      const createRuleGroupRuleData: IRuleGroupAlertRule = await this.ruleGroupAlertRuleService.registerAlertRule(ruleGroupAlertRuleData, partyId);
      res.status(201).json({ data: createRuleGroupRuleData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public listRegisterAlertRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findRuleGroupAlertRuleData: IRuleGroupAlertRule[] = await this.ruleGroupAlertRuleService.listRegisterAlertRule();
      res.status(200).json({ data: findRuleGroupAlertRuleData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public unregisterAlertRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
      } = req;
      const unRegisterAlertRule: UnRegisterRuleGroupAlertRuleDto = req.body;
      const flag: boolean = await this.ruleGroupAlertRuleService.unregisterAlertRule(unRegisterAlertRule, partyId);
      if (flag){
        res.status(201).json({ data: flag, message: 'deleted' });
      }else{
        res.status(204).json({ data: flag, message: 'No Content' });
      }
      
    } catch (error) {
      next(error);
    }
  };
}

export default RuleGroupAlertRuleController;
