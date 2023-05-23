import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PriceDto {
  @IsString()
  @IsNotEmpty()
  public price_no: string;
  @IsString()
  public price_type_code: string;
  @IsString()
  public price_type_code_name: string;
  @IsString()
  public region_no: string;
  @IsString()
  public region_code: string;
  @IsString()
  public region_name: string;
  @IsString()
  public charging_unit_type_code: string;
  @IsString()
  public charging_unit_type_code_name: string;
  @IsString()
  public rating_unit_type_code: string;
  @IsString()
  public rating_unit_type_code_name: string;
  @IsNumber()
  public charging_unit_basic_value: number;
  @IsString()
  public product_rating_type_code: string;
  @IsString()
  public product_rating_type_code_name: string;
  @IsString()
  public unit_code: string;
  @IsString()
  public unit_code_name: string;
  @IsNumber()
  public price: number;
  @IsString()
  public condition_type_code: string;
  @IsString()
  public condition_type_code_name: string;
  @IsNumber()
  public condition_price: number;
  @IsString()
  public price_description: string;
  @IsString()
  public free_unit_code: string;
  @IsString()
  public free_unit_code_name: string;
  @IsNumber()
  public free_value: number;
  @IsString()
  public metering_unit_code: string;
  @IsString()
  public metering_unit_code_name: string;
  @IsString()
  public start_date: string;
  @IsString()
  public price_attribute_code: string;
  @IsString()
  public price_attribute_code_name: string;
  @IsString()
  public price_version_name: string;
  @IsString()
  public pay_currency_code: string;
  @IsString()
  public pay_currency_code_name: string;
}
