import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional } from 'class-validator';

export class CreateRuleGroupDto {
  @IsString()
  @IsNotEmpty()
  public ruleGroupName: string;

  @IsString()
  @IsNotEmpty()
  public ruleGroupDescription: string;

  @IsString()
  public ruleGroupStatus: string;

  @IsString()
  @IsNotEmpty()
  public ruleGroupClusterId: string;

}
export class UpdateRuleGroupDto {
  @IsString()
  @IsOptional()
  public ruleGroupName: string;

  @IsString()
  @IsOptional()
  public ruleGroupDescription: string;

  
  @IsString()
  public ruleGroupStatus: string;

  @IsString()
  @IsOptional()
  public ruleGroupClusterId: string;

}

