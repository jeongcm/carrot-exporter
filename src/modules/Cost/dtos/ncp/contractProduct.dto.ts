import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ContractProductDto {
  @IsNumber()
  @IsNotEmpty()
  public contract_product_sequence: number;
  @IsNumber()
  @IsNotEmpty()
  public before_contract_product_sequence: number;
  @IsString()
  @IsNotEmpty()
  public product_code: string;
  @IsString()
  @IsNotEmpty()
  public price_no: string;
  @IsString()
  @IsNotEmpty()
  public promise_no: string;
  @IsString()
  @IsNotEmpty()
  public instance_no: string;
  @IsString()
  @IsNotEmpty()
  public product_item_kind_code: string;
  @IsString()
  @IsNotEmpty()
  public product_item_kind_code_name: string;
  @IsString()
  @IsNotEmpty()
  public product_rating_type_code: string;
  @IsString()
  @IsNotEmpty()
  public product_rating_type_code_name: string;
  @IsString()
  public service_status_code: string;
  @IsString()
  public service_status_code_name: string;
  @IsDate()
  public service_start_date: Date;
  @IsDate()
  public service_end_date: Date;
  @IsNumber()
  public product_size: number;
  @IsNumber()
  public product_count: number;
  @IsNumber()
  public contract_demand_cost_seq: number;
}
