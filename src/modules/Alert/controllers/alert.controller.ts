import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import {CreateAlertRuleDto } from '../dtos/alertRule.dto';
import AlertRuleService from '../services/alertRule.service';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import AlertReceivedService from '../services/alertReceived.service';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
import { AlertReceivedDto } from '../dtos/alertReceived.dto';

class AlertRuleController {
  public alertRuleService = new AlertRuleService();
  public alertReceivedService = new AlertReceivedService();

  public getAllAlertRules = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findAllChannelsData: IAlertRule[] = await this.alertRuleService.getAlertRule(customerAccountKey);
      res.status(200).json({ data: findAllChannelsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getAllAlertReceived = async (req:IRequestWithUser, res:Response, next:NextFunction) => {
    try{
      const customerAccountKey = req.customerAccountKey;
      const findAllAlertReceived: IAlertReceived[] = await this.alertReceivedService.getAlertReceived(customerAccountKey);
      res.status(200).json({data:findAllAlertReceived, message: 'findAll'});
    } catch(error){
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

  public updateAlertReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertReceivedId: string = req.params.alertReceivedId;
      const {
        user: { partyId },
      } = req;
      const alertReceivedData = req.body;
      const customerAccountKey = req.customerAccountKey;
      const updateAlertReceivedData: IAlertReceived = await this.alertReceivedService.updateAlertReceived(alertReceivedId, alertReceivedData, customerAccountKey, partyId);
      res.status(200).json({ data: updateAlertReceivedData, message: 'updated' });
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

  public createAlertReceived = async (req:IRequestWithUser,res:Response,next:NextFunction) => {
    try{
      const customerAccountKey = req.customerAccountKey;
      const{user: { partyId },} = req;
      const alertReceivedData: AlertReceivedDto = req.body;
      const createAlertReceivedData: IAlertReceived = await this.alertReceivedService.createAlertReceived(alertReceivedData, customerAccountKey, partyId);
      res.status(201).json({ data: createAlertReceivedData, message: 'created' });
    }catch(error){
      next(error);
    }
  }

  public deleteAlertReceived = async (req:IRequestWithUser, res:Response, next:NextFunction) => {
    try{
      const alertReceivedId: string = req.params.alertReceivedId;
      const customerAccountKey = req.customerAccountKey;
      const deletedFlag = await this.alertReceivedService.deleteAlertReceived(customerAccountKey, alertReceivedId);
      if (deletedFlag){
        res.status(200).json({ data: deletedFlag, message: 'deleted' });
      }else{
        res.status(204).json({ data: deletedFlag, message: 'No Content' });
      }
    }catch(error){
      next(error);
    }
  }
}

export default AlertRuleController;
