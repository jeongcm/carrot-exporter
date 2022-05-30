import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional } from 'class-validator';

export class RuleGroupDto {
  @IsString()
  @IsNotEmpty()
  public ruleGroupName: string;

  @IsString()
  public ruleGroupDescription: string;

  @IsString()
  public ruleGroupStatus: string;

}

