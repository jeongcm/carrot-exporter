/*
Alert Routes

Notion:
https://www.notion.so/nexclipper/Alert-Feature-Design-dcdd6130e1bf4f05a8333a2b31a5756c
*/
import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import AlertController from '@/modules/Alert/controllers/alert.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
// import AuthService from '@/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import { AlertReceivedDto } from '../dtos/alertReceived.dto';
class AlertRoute implements Routes {
  public router = Router();
  public alertController = new AlertController();
  // public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/alert/rule', authMiddleware, validationMiddleware(CreateAlertRuleDto, 'body'), this.alertController.createAlertRule);
    this.router.get('/alert/rule', authMiddleware, this.alertController.getAllAlertRules);
    this.router.put(
      '/alert/rule/:alertRuleId',
      authMiddleware,
      validationMiddleware(CreateAlertRuleDto, 'body'),
      this.alertController.updateAlertRule,
    );
    this.router.post('/alert/received', authMiddleware, validationMiddleware(AlertReceivedDto, 'body'), this.alertController.createAlertReceived);
    this.router.get('/alert/received', authMiddleware, this.alertController.getAllAlertReceived);
    this.router.get('/alert/received/recent', authMiddleware, this.alertController.getAllAlertReceivedMostRecent);
    this.router.get('/alert/received/:alertReceivedId', authMiddleware, this.alertController.getAlertReceived);
    this.router.get('/alert/received/:alertReceivedId/history', authMiddleware, this.alertController.getAlertReceivedHistory);
    this.router.put(
      '/alert/received/:alertReceivedId',
      authMiddleware,
      validationMiddleware(AlertReceivedDto, 'body'),
      this.alertController.updateAlertReceived,
    );
    this.router.delete('/alert/received/:alertReceivedId', authMiddleware, this.alertController.deleteAlertReceived);
  }
}

export default AlertRoute;
