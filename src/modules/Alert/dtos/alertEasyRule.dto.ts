import { IsString, IsNotEmpty, IsNumber, IsDate, isNotEmpty, IsObject } from 'class-validator';

export class CreateAlertEasyRuleDto {
  @IsString()
  @IsNotEmpty()
  public alertRuleName: string;
}
export class CreateAlertTargetGroupDto {
  @IsString()
  @IsNotEmpty()
  public alertTargetGroupName: string;
  @IsString()
  @IsNotEmpty()
  public alertTargetGroupDescription: string;
}
