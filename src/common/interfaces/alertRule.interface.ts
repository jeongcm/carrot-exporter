import { double } from 'aws-sdk/clients/lightsail';

export interface IAlertRule {
  alertRuleKey: number;
  customerAccountKey: number;
  alertRuleId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  alertRuleName: string;
  alertRuleGroup: string;
  alertRuleQuery: string;
  alertRuleDuration: number;
  alertRuleSeverity: string;
  alertRuleDescription: string;
  alertRuleSummary: string;
  alertRuleRunbook: string;
  alertRuleState: string;
  alertRuleHealth: string;
  alertRuleEvaluationTime: double;
  alertRuleLastEvaluation: Date;
  resourceGroupUuid: string;
}

export interface IAlertRuleGraph {
  alertRuleId: string;
  alertRuleGroup: string;
  alertRuleState: string;
  resourceGroupUuid: string;
}
