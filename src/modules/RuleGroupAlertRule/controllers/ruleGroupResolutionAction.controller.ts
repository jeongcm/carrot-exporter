import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { IRuleGroupResolutionAction } from '@/common/interfaces/ruleGroupResolutionAction.interface';
import { NextFunction, Response } from 'express';
import { RuleGroupResolutionActionDto, UnRegisterResolutionActionDto } from '../dtos/ruleGroupResolutionAction.dto';
import RuleGroupResolutionActionService from '../services/ruleGroupResolutionAction.service';

class RuleGroupResolutionActionController {
    public ruleGroupResolutionActionService = new RuleGroupResolutionActionService();

  public registerResolutionAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
      } = req;
      const ruleGroupResolutionActionData: RuleGroupResolutionActionDto = req.body;
      const createRuleGroupResolutionAction: IRuleGroupResolutionAction = await this.ruleGroupResolutionActionService.registerResolutionAction(ruleGroupResolutionActionData, partyId);
      res.status(201).json({ data: createRuleGroupResolutionAction, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public listRegisterResolutionAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findRuleGroupResolutionActionData: IRuleGroupResolutionAction[] = await this.ruleGroupResolutionActionService.listRegisterResolutionAction();
      res.status(200).json({ data: findRuleGroupResolutionActionData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public unregisterResolutionAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
      } = req;
      const unRegisterResolutionActionData: UnRegisterResolutionActionDto = req.body;
      const flag: boolean = await this.ruleGroupResolutionActionService.unregisterResolutionAction(unRegisterResolutionActionData, partyId);
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

export default RuleGroupResolutionActionController;