import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { NextFunction, Response } from 'express';
import { RuleGroupDto } from '../dtos/ruleGroup.dto';
import RuleGroupService from '../services/ruleGroup.service';

class RuleGroupController {
  public ruleGroupService = new RuleGroupService();

  public getRuleGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      
      const findRuleGroupData: IRuleGroup[] = await this.ruleGroupService.getRuleGroup();
      res.status(200).json({ data: findRuleGroupData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getRuleGroupByModelId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {body:{bayesianModelId = ""}} = req;
      const findRuleGroupData: IRuleGroup[] = await this.ruleGroupService.getRuleGroupByModelId(bayesianModelId);
      res.status(200).json({ data: findRuleGroupData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getRuleGroupById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const ruleGroupId: string = req.params.ruleGroupId;
      const findRuleGroupData: IRuleGroup = await this.ruleGroupService.getRuleGroupById(ruleGroupId);
      res.status(200).json({ data: findRuleGroupData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public deleteRuleGroup = async (req:IRequestWithUser, res:Response, next:NextFunction) => {
    try{
      const ruleGroupId: string = req.params.ruleGroupId;
      const deletedFlag = await this.ruleGroupService.deleteRuleGroup(ruleGroupId);
      if (deletedFlag){
        res.status(200).json({ data: deletedFlag, message: 'deleted' });
      }else{
        res.status(204).json({ data: deletedFlag, message: 'No Content' });
      }
    }catch(error){
      next(error);
    }
  }

  public createRuleGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
      } = req;
      const ruleGroupData: RuleGroupDto = req.body;
      const createRuleGroupData: IRuleGroup = await this.ruleGroupService.createRuleGroup(ruleGroupData, partyId);
      res.status(201).json({ data: createRuleGroupData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateRuleGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const ruleGroupId: string = req.params.ruleGroupId;
      const {
        user: { partyId },
      } = req;
      const ruleGroupData: RuleGroupDto = req.body;
      const updateRuleGroupUpdate: IRuleGroup = await this.ruleGroupService.updateRuleGroup(
        ruleGroupId,
        ruleGroupData,
        partyId,
      );
      res.status(200).json({ data: updateRuleGroupUpdate, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default RuleGroupController;
