import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDate, isNotEmpty, IsObject } from 'class-validator';

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
  @IsOptional()
  @IsString()
  public alertEasyRuleThreshold2: string;
  @IsString()
  public alertEasyRuleThreshold1Unit: string;
  @IsOptional()
  @IsString()
  public alertEasyRuleThreshold2Unit: string;
  @IsString()
  public alertEasyRuleThreshold1Max: string;
  @IsOptional()
  @IsString()
  public alertEasyRuleThreshold2Max: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleQuery: string;
  @IsString()
  @IsNotEmpty()
  public customerAccountId: string;
}

export class UpdateAlertEasyRuleDto {
  @IsString()
  @IsNotEmpty()
  public alertTargetSubGroupId: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleId: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleName: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleDescription: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleSummary: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleQuery: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleSeverity: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleGroup: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleDuration: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleThreshold1: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleThreshold2: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleThreshold1Unit: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleThreshold2Unit: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleThreshold1Max: string;
  @IsString()
  @IsOptional()
  public alertEasyRuleThreshold2Max: string;
  @IsString()
  @IsNotEmpty()
  public resourceGroupUuid: string;
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

export class CreateAlertEasyRuleForClusterDto {
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
  @IsOptional()
  @IsString()
  public alertEasyRuleThreshold2: string;
  @IsString()
  public alertEasyRuleThreshold1Unit: string;
  @IsOptional()
  @IsString()
  public alertEasyRuleThreshold2Unit: string;
  @IsString()
  public alertEasyRuleThreshold1Max: string;
  @IsOptional()
  @IsString()
  public alertEasyRuleThreshold2Max: string;
  @IsString()
  @IsNotEmpty()
  public alertEasyRuleQuery: string;
  @IsString()
  @IsNotEmpty()
  public customerAccountId: string;
  @IsString()
  @IsNotEmpty()
  public resourceGroupUuid: string;
}
