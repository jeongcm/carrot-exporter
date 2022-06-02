export interface IModelRuleScore {
    modelRuleScoreKey: number;
    ruleGroupKey: number;
    bayesianModelKey: number;
    modelRuleScoreId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    scoreCard: JSON;
}