import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional } from 'class-validator';

export class RuleGroupAlertRuleDto {
  @IsNumber()
  public ruleGroupKey: number;

  @IsNumber()
  public alertRuleKey: number;

  @IsString()
  public ruleGroupAlertRuleStatus: string;

}


export class UnRegisterRuleGroupAlertRuleDto {
  @IsNumber()
  public ruleGroupKey: number;

  @IsNumber()
  public alertRuleKey: number;

}
