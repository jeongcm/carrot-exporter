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
    version: string;
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
    version: string;
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
    version: string;
    ModelRuleScores: JSON;
    ResourceGroup: JSON;
  }  