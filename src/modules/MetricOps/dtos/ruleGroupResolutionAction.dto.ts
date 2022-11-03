import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional, IsJSON, IsArray } from 'class-validator';

export class RuleGroupResolutionActionDto {
  @IsString()
  @IsNotEmpty()
  public ruleGroupId: string;

  @IsArray()
  @IsNotEmpty()
  public resolutionActionIds: Array<{}>;
}

export class UnRegisterResolutionActionDto {
  @IsString()
  @IsNotEmpty()
  public ruleGroupId: string;

  @IsArray()
  @IsNotEmpty()
  public resolutionActionIds: Array<{}>;
}
