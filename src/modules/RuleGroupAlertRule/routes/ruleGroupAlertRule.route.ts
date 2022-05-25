/*
Alert Routes

Notion:
https://www.notion.so/nexclipper/Alert-Feature-Design-dcdd6130e1bf4f05a8333a2b31a5756c
*/
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
// import AuthService from '@/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { Router } from 'express';
import RuleGroupAlertRuleController from '../controllers/ruleGroupAlertRule.controller';
import { RuleGroupAlertRuleDto, UnRegisterRuleGroupAlertRuleDto } from '../dtos/ruleGroupAlertRule.dto';

class RuleGroupAlertRoute implements Routes {
  public router = Router();
  public ruleGroupAlertRuleController = new RuleGroupAlertRuleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/register/alert/rule', authMiddleware, validationMiddleware(RuleGroupAlertRuleDto, 'body'), this.ruleGroupAlertRuleController.registerAlertRule);
    this.router.post('/unregister/alert/rule', authMiddleware, validationMiddleware(UnRegisterRuleGroupAlertRuleDto, 'body'), this.ruleGroupAlertRuleController.unregisterAlertRule);
    this.router.get('/register/alert/rule', authMiddleware, this.ruleGroupAlertRuleController.listRegisterAlertRule);
    
  }
}

export default RuleGroupAlertRoute;
