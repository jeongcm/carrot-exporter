export interface IRuleGroup {
  ruleGroupKey: number;
  ruleGroupId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  ruleGroupName: string;
  ruleGroupDescription: string;
  ruleGroupStatus: string;
  resourceGroupKey: number;
}
