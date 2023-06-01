import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProductPriceDto {
  @IsString()
  @IsNotEmpty()
  public product_item_kind_code: string;
  @IsString()
  public product_item_kind_code_name: string;
  @IsString()
  public product_item_kind_detail_code: string;
  @IsString()
  public product_item_kind_detail_code_name: string;
  @IsString()
  public product_code: string;
  @IsString()
  public product_name: string;
  @IsString()
  public product_description: string;
  @IsString()
  public software_type_code: string;
  @IsString()
  public software_type_code_name: string;
  @IsString()
  public product_type_code: string;
  @IsString()
  public product_type_code_name: string;
  @IsNumber()
  public gpu_count: number;
  @IsNumber()
  public cpu_count: number;
  @IsNumber()
  public memory_size: number;
  @IsNumber()
  public base_block_storage_size: number;
  @IsString()
  public db_kind_code: string;
  @IsString()
  public db_kind_code_name: string;
  @IsString()
  public os_information: string;
  @IsString()
  public platform_type_code: string;
  @IsString()
  public platform_type_code_name: string;
  @IsString()
  public os_type_code: string;
  @IsString()
  public os_type_code_name: string;
  @IsString()
  public platform_category_code: string;
  @IsString()
  public disk_type_code: string;
  @IsString()
  public disk_type_code_name: string;
  @IsString()
  public disk_detail_type_code: string;
  @IsString()
  public disk_detail_type_code_name: string;
  @IsString()
  public generation_code: string;
  @IsString()
  public price_no: string;
  @IsString()
  public promise_list: string;
  @IsString()
  public period_unit_list: string;
  @IsString()
  public country_unit_list: string;
  @IsString()
  public package_unit_list: string;
}
