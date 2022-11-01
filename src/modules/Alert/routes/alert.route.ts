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
import { CreateAlertEasyRuleDto, CreateAlertTargetGroupDto, CreateAlertTargetSubGroupDto, UpdateAlertEasyRuleDto } from '../dtos/alertEasyRule.dto';
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
    this.router.get('/alert/rule/:alertRuleId', authMiddleware, this.alertController.getAlertRuleById);
    this.router.post('/alert/received', authMiddleware, validationMiddleware(AlertReceivedDto, 'body'), this.alertController.createAlertReceived);
    this.router.get('/alert/received', authMiddleware, this.alertController.getAllAlertReceived);
    this.router.get('/alert/received/recent', authMiddleware, this.alertController.getAllAlertReceivedMostRecent);
    this.router.get('/alert/received/byalertrule/:alertRuleId', authMiddleware, this.alertController.getAllAlertReceivedByAlertRuleId);
    this.router.get('/alert/received/alertReceivedHash/:alertHash', authMiddleware, this.alertController.getAllAlertReceivedByAlertHash);
    this.router.get('/alert/received/:alertReceivedId', authMiddleware, this.alertController.getAlertReceived);
    this.router.get('/alert/received/:alertReceivedId/history', authMiddleware, this.alertController.getAlertReceivedHistory);
    this.router.put(
      '/alert/received/:alertReceivedId',
      authMiddleware,
      validationMiddleware(AlertReceivedDto, 'body'),
      this.alertController.updateAlertReceived,
    );
    this.router.delete('/alert/received/:alertReceivedId', authMiddleware, this.alertController.deleteAlertReceived);
    this.router.get('/alertRule/graph/:status', authMiddleware, this.alertController.getAllAlertRulesGraph);
    this.router.post('/alertRule/setting', authMiddleware, this.alertController.createAlertRuleSetting);
    this.router.post('/alertRule/setting/get', authMiddleware, this.alertController.getAllSettingAlertRule);
    this.router.put('/alertRule/setting/:alertRuleId', authMiddleware, this.alertController.updateAlertRuleSetting);
    this.router.get('/alertRule/:ruleGroupId', authMiddleware, this.alertController.getAlertRuleByRuleGroupId);
    this.router.get('/alertRule/resourceGroup/:resourceGroupId', authMiddleware, this.alertController.getAlertRuleByResourceGroupUuid);

    this.router.get('/alertRule/:alertRuleId/alertTimeline', authMiddleware, this.alertController.getAlertTimelinesByAlertRuleId);
    this.router.get('/alertRule/:alertRuleId/alertNotiScheduled', authMiddleware, this.alertController.getAlertNotiScheduledByAlertRuleId);

    this.router.get('/alertTimeline/resource/:resourceId', authMiddleware, this.alertController.getAlertTimelineByResourceId);
    this.router.get('/alertTimeline/:alertTimelineId/alertReceived', authMiddleware, this.alertController.getAlertReceivedByAlertTimelineId);
    this.router.post(
      '/alertTargetGroup',
      authMiddleware,
      validationMiddleware(CreateAlertTargetGroupDto, 'body'),
      this.alertController.createAlertTargetGroup,
    );
    this.router.post(
      '/alertTargetSubGroup',
      authMiddleware,
      validationMiddleware(CreateAlertTargetSubGroupDto, 'body'),
      this.alertController.createAlertTargetSubGroup,
    );
    this.router.post(
      '/alertEasyRule',
      authMiddleware,
      validationMiddleware(CreateAlertEasyRuleDto, 'body'),
      this.alertController.createAlertEasyRule,
    );
    this.router.put('/alertEasyRule', authMiddleware, validationMiddleware(UpdateAlertEasyRuleDto, 'body'), this.alertController.updateAlertEasyRule);
    this.router.get('/alertEasyRule/all', authMiddleware, this.alertController.getAlertEasyRuleAll);
    this.router.get('/alertEasyRule/:alertEasyRuleId', authMiddleware, this.alertController.getAlertEasyRuleById);
    this.router.get('/alertTargetGroup/all', authMiddleware, this.alertController.getAlertTargetGroupAll);
    this.router.delete('/alertTargetSubGroup/:alertTargetSubGroupId', authMiddleware, this.alertController.deleteAlertTargetSubGroup);
  }
}

export default AlertRoute;
