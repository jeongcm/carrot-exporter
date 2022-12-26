import { IsString, IsNotEmpty, IsOptional, isNotEmpty } from 'class-validator';

export class EvaluateDto {
  public bayesianModelKey: number;
  public bayesianModelId: string;
  public scoreCard: JSON;
}

export class resultEvaluationDto {
  public evaluationRequest: JSON;
  public evaluationResult: JSON;
  public evaluationResultStatus: string;
  public evaluationId: string;
  public resourceId: string;
  public resourceName: string;
  public resourceType: string;
  public incidentId: string;
  public ruleGroup: JSON;
  public bayesianModel: JSON;
}

export class evaluateMonitoringTargetDto {
  @IsString()
  @IsNotEmpty()
  public anomalyMonitoringTargetId: string;
  @IsString()
  @IsNotEmpty()
  public resourceId: string;
}

export class evaluateCustomerDto {
  @IsString()
  @IsNotEmpty()
  public customerAccountId: string;
}
