import { IsNotEmpty, IsString } from 'class-validator';

export class UsageDto {
  @IsString()
  @IsNotEmpty()
  public metering_type_code: string;
  @IsString()
  public metering_type_code_name: string;
  @IsString()
  @IsNotEmpty()
  public use_month: string;
  @IsString()
  @IsNotEmpty()
  public usage_quantity: number;
  @IsString()
  @IsNotEmpty()
  public unit_code: string;
  @IsString()
  @IsNotEmpty()
  public unit_code_name: string;
  @IsString()
  public user_usage_quantity: number;
  @IsString()
  public user_unit_code: string;
  @IsString()
  public user_unit_code_name: string;
}
