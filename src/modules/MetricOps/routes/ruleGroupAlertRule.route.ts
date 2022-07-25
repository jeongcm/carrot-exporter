/*
Alert Routes

Notion:
https://www.notion.so/nexclipper/Alert-Feature-Design-dcdd6130e1bf4f05a8333a2b31a5756c
*/
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { Router } from 'express';
import RuleGroupAlertRuleController from '../controllers/ruleGroupAlertRule.controller';
import RuleGroupResolutionActionController from '../controllers/ruleGroupResolutionAction.controller';
import { RuleGroupAlertRuleDto, UnRegisterRuleGroupAlertRuleDto } from '../dtos/ruleGroupAlertRule.dto';
import { RuleGroupResolutionActionDto, UnRegisterResolutionActionDto } from '../../MetricOps/dtos/ruleGroupResolutionAction.dto';

class RuleGroupAlertRoute implements Routes {
  public router = Router();
  public ruleGroupAlertRuleController = new RuleGroupAlertRuleController();
  public ruleGroupResolutionActionController = new RuleGroupResolutionActionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/ruleGroup/alertRule/register',
      authMiddleware,
      validationMiddleware(RuleGroupAlertRuleDto, 'body'),
      this.ruleGroupAlertRuleController.registerAlertRule,
    );
    this.router.post(
      '/ruleGroup/alertRule/unregister',
      authMiddleware,
      validationMiddleware(UnRegisterRuleGroupAlertRuleDto, 'body'),
      this.ruleGroupAlertRuleController.unregisterAlertRule,
    );
    this.router.post(
      '/ruleGroup/resolutionAction/register',
      authMiddleware,
      validationMiddleware(RuleGroupResolutionActionDto, 'body'),
      this.ruleGroupResolutionActionController.registerResolutionAction,
    );
    this.router.post(
      '/ruleGroup/resolutionAction/unregister',
      authMiddleware,
      validationMiddleware(UnRegisterResolutionActionDto, 'body'),
      this.ruleGroupResolutionActionController.unregisterResolutionAction,
    );
    this.router.get('/ruleGroup/:ruleGroupId/alertRule', authMiddleware, this.ruleGroupAlertRuleController.listRegisterAlertRule);
    this.router.get(
      '/ruleGroup/:ruleGroupId/resolutionAction',
      authMiddleware,
      this.ruleGroupResolutionActionController.listRegisterResolutionAction,
    );
  }
}

export default RuleGroupAlertRoute;
