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
  alertTargetSubGroupKey: number;
  alertEasyRuleDuration: string;
  alertEasyRuleThreshold1: string;
  alertEasyRuleThreshold2: string;
  alertEasyRuleQuery: string;
  alertEasyRuleGroup: string;
  alertEasyRuleSeverity: string;
  alertEasyRuleSummary: string;
  customerAccountKey: number;
}
