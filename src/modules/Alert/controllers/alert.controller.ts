import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import AlertRuleService from '../services/alertRule.service';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';

class AlertRuleController {
  public alertRuleService = new AlertRuleService();

  public getAllAlertRules = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findAllChannelsData: IAlertRule[] = await this.alertRuleService.getAlertRule(customerAccountKey);
      res.status(200).json({ data: findAllChannelsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public updateAlertRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertRuleId: string = req.params.alertRuleId;
      const {
        user: { partyId },
      } = req;
      const alertRuleData = req.body;
      const customerAccountKey = req.customerAccountKey;
      const updateAlertRuleData: IAlertRule = await this.alertRuleService.updateAlertRule(alertRuleId, alertRuleData, customerAccountKey, partyId);
      res.status(200).json({ data: updateAlertRuleData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public createAlertRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const {
        user: { partyId },
      } = req;
      const alertRuleData: CreateAlertRuleDto = req.body;
      const createAlertRuleData: IAlertRule = await this.alertRuleService.createAlertRule(alertRuleData, customerAccountKey, partyId);
      res.status(201).json({ data: createAlertRuleData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default AlertRuleController;
