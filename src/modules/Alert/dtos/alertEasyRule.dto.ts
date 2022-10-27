import { IsString, IsNotEmpty, IsNumber, IsDate, isNotEmpty, IsObject } from 'class-validator';

export class CreateAlertEasyRuleDto {
  @IsString()
  @IsNotEmpty()
  public alertTargetSubGroupId: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleName: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleDescription: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleSummary: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleSeverity: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleGroup: string;

  @IsString()
  @IsNotEmpty()
  public alertEasyRuleDuration: string;
  @IsString()
  public alertEasyRuleThreshold1: string;
  @IsString()
  public alertEasyRuleThreshold2: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleQuery: string;
  @IsString()
  @IsNotEmpty()
  public customerAccountId: string;
}
export class CreateAlertTargetGroupDto {
  @IsString()
  @IsNotEmpty()
  public alertTargetGroupName: string;
  @IsString()
  @IsNotEmpty()
  public alertTargetGroupDescription: string;
}

export class CreateAlertTargetSubGroupDto {
  @IsString()
  @IsNotEmpty()
  public alertTargetSubGroupName: string;
  @IsString()
  @IsNotEmpty()
  public alertTargetSubGroupDescription: string;
  @IsString()
  @IsNotEmpty()
  public alertTargetGroupId: string;
}
