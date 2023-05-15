import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ContractDemandCostDto {
  @IsNumber()
  @IsNotEmpty()
  public contract_demand_cost_sequence: number;
  @IsString()
  @IsNotEmpty()
  public member_no: string;
  @IsString()
  @IsNotEmpty()
  public region_code: string;
  @IsString()
  @IsNotEmpty()
  public demand_type_code: string;
  @IsString()
  @IsNotEmpty()
  public demand_type_code_name: string;
  @IsString()
  @IsNotEmpty()
  public demand_type_detail_code: string;
  @IsString()
  @IsNotEmpty()
  public demand_type_detail_code_name: string;
  @IsString()
  @IsNotEmpty()
  public contract_no: string;
  @IsString()
  @IsNotEmpty()
  public demand_month: string;
  @IsNumber()
  @IsNotEmpty()
  public unit_usage_quantity: string;
  @IsNumber()
  @IsNotEmpty()
  public package_unit_usage_quantity: number;
  @IsNumber()
  @IsNotEmpty()
  public total_unit_usage_quantity: number;
  @IsString()
  public usage_unit_code: string;
  @IsString()
  public usage_unit_code_name: string;
  @IsNumber()
  public product_price: number;
  @IsNumber()
  public use_amount: number;
  @IsNumber()
  public promotion_discount_amount: number;
  @IsNumber()
  public etc_discount_amount: number;
  @IsNumber()
  public promise_discount_amount: number;
  @IsNumber()
  public demand_amount: number;
  @IsDate()
  public write_date: Date;
  @IsNumber()
  public member_price_discount_amount: number;
  @IsNumber()
  public member_promise_discount_amount: number;
  @IsString()
  public pay_currency_code: string;
  @IsString()
  public pay_currency_codeName: string;
  @IsNumber()
  public this_month_applied_exchange_rate: number;
}
