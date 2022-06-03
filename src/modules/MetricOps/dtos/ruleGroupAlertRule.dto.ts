import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional } from 'class-validator';

export class RuleGroupAlertRuleDto {
  @IsString()
  public ruleGroupId: string;

  @IsString()
  public alertRuleId: string;

  @IsString()
  public ruleGroupAlertRuleStatus: string;

}


export class UnRegisterRuleGroupAlertRuleDto {
  @IsString()
  public ruleGroupId: string;

  @IsString()
  public alertRuleId: string;

}
