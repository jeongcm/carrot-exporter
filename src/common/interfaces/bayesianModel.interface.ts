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
    bayesianModelClusterId:string;
    bayesianModelScoreCard:JSON
  }