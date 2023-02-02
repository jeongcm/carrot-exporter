import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional, IsArray } from 'class-validator';

export class RuleGroupAlertRuleDto {
  @IsString()
  public ruleGroupId: string;

  @IsArray()
  public alertRuleIds: Array<{}>;

  @IsString()
  public ruleGroupAlertRuleStatus: string;
}

export class UnRegisterRuleGroupAlertRuleDto {
  @IsString()
  public ruleGroupId: string;

  @IsArray()
  public alertRuleIds: Array<{}>;
}
