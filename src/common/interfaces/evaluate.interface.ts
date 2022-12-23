export interface IEvaluation {
  evaluationKey: number;
  evaluationId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  requestedAt: Date;
  evaluatedAt: Date;
  evaluationResultStatus: string;
  evaluationStatus: string;
  evaluationRequest: any;
  evaluationResult: any;
  anomalyMonitoringTargetKey: number;
  customerAccountKey: number;
  bayesianModelKey: number;
  resourceGroupKey: number;
}
