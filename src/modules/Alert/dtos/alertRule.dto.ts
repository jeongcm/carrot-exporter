import { IsString, IsNotEmpty, IsNumber, IsDate, isNotEmpty, IsObject } from 'class-validator';

export class CreateAlertRuleDto {
  @IsString()
  @IsNotEmpty()
  public alertRuleName: string;

  @IsString()
  public alertRuleGroup: string;

  @IsString()
  public alertRuleQuery: string;

  @IsNumber()
  public AlertRuleDuration: number;

  @IsString()
  public alertRuleSeverity: string;

  @IsString()
  @IsNotEmpty()
  public alertRuleDescription: string;

  @IsString()
  @IsNotEmpty()
  public alertRuleRunbook: string;

  @IsString()
  @IsNotEmpty()
  public alertRuleSummary: string;

  @IsString()
  @IsNotEmpty()
  public alertRuleState: string;

  @IsString()
  @IsNotEmpty()
  public alertRuleMlGroup: string;

  @IsString()
  @IsNotEmpty()
  public alertRuleMlSubGroup: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupUuid: string;

  @IsString()
  public alertRuleHealth: string;

  public alertRuleEvaluationTime: number;

  public alertRuleLastEvaluation: Date;
}
