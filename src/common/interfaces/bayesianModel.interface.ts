export interface IBayesianModel {
    bayesianModelKey: number;
    bayesianModelId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    bayesianModelName: string;
    bayesianModelStatus: string;
    bayesianModelDescription: string;
    customerAccountKey: number;
    bayesianModelResourceType: string;
    bayesianModelScoreCard:JSON
    bayesianModelClusterId: string;
  }

  export interface IBayesianDBModel {
    bayesianModelKey: number;
    bayesianModelId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    bayesianModelName: string;
    bayesianModelStatus: string;
    bayesianModelDescription: string;
    customerAccountKey: number;
    bayesianModelResourceType: string;
    bayesianModelScoreCard:JSON
    resourceGroupKey: number;
  }  

  export interface IBayesianJoinDBModel {
    bayesianModelKey: number;
    bayesianModelId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    bayesianModelName: string;
    bayesianModelStatus: string;
    bayesianModelDescription: string;
    customerAccountKey: number;
    bayesianModelResourceType: string;
    bayesianModelScoreCard:JSON
    resourceGroupKey: number;
    ModelRuleScores: JSON;
    ResourceGroup: JSON;
  }  