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
  resourceGroupKey: number;
  resourceGroupUuid: string;
  alertTargetSubGroupKey: number;
  alertEasyRuleDuration: string;
  alertEasyRuleThreshold1: string;
  alertEasyRuleThreshold2: string;
  alertEasyRuleThreshold1Unit: string;
  alertEasyRuleThreshold2Unit: string;
  alertEasyRuleThreshold1Max: string;
  alertEasyRuleThreshold2Max: string;
  alertEasyRuleQuery: string;
  alertEasyRuleGroup: string;
  alertEasyRuleSeverity: string;
  alertEasyRuleSummary: string;
  customerAccountKey: number;
}
