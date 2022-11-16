import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { CreateResolutionActionDto, UpdateResolutionActionDto } from '../dtos/resolutionAction.dto';
import ResolutionActionService from '../services/resolutionAction.service';
import { IResolutionAction } from '@/common/interfaces/resolutionAction.interface';

class ResolutionActionController {
  public resolutionActionService = new ResolutionActionService();

  public getAllResolutionAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const resolutionActionList: IResolutionAction[] = await this.resolutionActionService.findAllResolutionAction();
      res.status(200).json({ data: resolutionActionList, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public deleteResolutionActionByResolutionActionId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resolutionActionId: string = req.params.resolutionActionId;
      const deleted = await this.resolutionActionService.deleteResolutionActionByResolutionActionId(resolutionActionId);
      res.status(200).json({ data: deleted, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public createResolutionAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { user: { partyId } = {}, systemId, customerAccountKey } = req;
      const resolutionActionData: CreateResolutionActionDto = req.body;
      const resolutionActionType = req.body.resolutionActionType || 'MO';
      resolutionActionData.resolutionActionType = resolutionActionType;
      const newResolutionAction: IResolutionAction = await this.resolutionActionService.createResolutionAction(
        resolutionActionData,
        systemId || partyId,
      );
      res.status(201).json({ data: newResolutionAction, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateResolutionAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { user: { partyId } = {}, params: { resolutionActionId } = {} } = req;
      const resolutionActionData: UpdateResolutionActionDto = req.body;
      const updateResolutionActionData = await this.resolutionActionService.updateResolutionAction(resolutionActionId, resolutionActionData, partyId);
      res.status(200).json({ data: updateResolutionActionData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getResolutionActionById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
        params: { resolutionActionId },
      } = req;
      const resolutionActionData: IResolutionAction = await this.resolutionActionService.findResolutionActionById(resolutionActionId);
      res.status(200).json({ data: resolutionActionData, message: 'find' });
    } catch (error) {
      next(error);
    }
  };

  public findResolutionActionWithPreById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
        params: { resolutionActionId },
      } = req;
      const resolutionActionData = await this.resolutionActionService.findResolutionActionWithPreById(resolutionActionId);
      res.status(200).json({ data: resolutionActionData, message: 'find' });
    } catch (error) {
      next(error);
    }
  };

  public getResolutionActionByRuleGroupId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { ruleGroupId },
      } = req;
      const resolutionActionList: IResolutionAction[] = await this.resolutionActionService.getResolutionActionByRuleGroupId(ruleGroupId);
      return res.status(200).json({ data: resolutionActionList, message: 'findAll' });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}

export default ResolutionActionController;
