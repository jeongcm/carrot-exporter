import { IsString, IsNotEmpty, IsNumber, IsDate, isNotEmpty } from 'class-validator';

export class CreateAlertRuleDto{
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
  public alertRuleMLGroup: string;

  @IsString()
  @IsNotEmpty()
  public alertRuleMLSubGroup: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupUUID: string;

}