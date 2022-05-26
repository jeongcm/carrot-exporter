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
import RuleGroupController from '../controllers/ruleGroup.controller';
import { RuleGroupDto } from '../dtos/ruleGroup.dto';
class RuleGroupRoute implements Routes {
  public router = Router();
  public ruleGroupController = new RuleGroupController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/rule/group', authMiddleware, validationMiddleware(RuleGroupDto, 'body'), this.ruleGroupController.createRuleGroup);
    this.router.get('/rule/group', authMiddleware, this.ruleGroupController.getRuleGroup);
    this.router.get('/rule/group/:ruleGroupId', authMiddleware, this.ruleGroupController.getRuleGroupById);
    this.router.put(
      '/rule/group/:ruleGroupId',
      authMiddleware,
      validationMiddleware(RuleGroupDto, 'body'),
      this.ruleGroupController.updateRuleGroup,
    );
    this.router.delete('/rule/group/:ruleGroupId', authMiddleware, this.ruleGroupController.deleteRuleGroup);
  }
}

export default RuleGroupRoute;
