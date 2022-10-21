export interface IAlertEasyRule {
  alertEasyRuleKey: number;
  alertEasyRuleId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  alertEasyRuleName: string;
  alertEasyRuleDescription: string;
  resourceGroupUuid: string;
  alertRuleKey: number;
  alertTargetSubGroupKey: number;
  alertEasyRuleDuration: number;
  alertEasyRuleThreshold1: number;
  alertEasyRuleThreshold2: number;
  alertEasyRuleQuery: string;
}
