import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional, IsJSON } from 'class-validator';

export class RuleGroupResolutionActionDto {
  @IsString()
  public ruleGroupId: string;

  @IsString()
  public resolutionActionId: string;

  @IsString()
  public resolutionActionDescription: string;

  @IsObject()
  public sudoryTemplateArgsOption: JSON;
}

export class UnRegisterResolutionActionDto {
  @IsString()
  public ruleGroupId: string;

  @IsString()
  public resolutionActionId: string;
}