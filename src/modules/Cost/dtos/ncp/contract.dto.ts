import { IsNotEmpty, IsString } from 'class-validator';

export class ContractDto {
  @IsString()
  @IsNotEmpty()
  public member_no: string;
  @IsString()
  @IsNotEmpty()
  public contract_no: string;
  @IsString()
  @IsNotEmpty()
  public conjunction_contract_no: string;
  @IsString()
  @IsNotEmpty()
  public contract_type_code: string;
  @IsString()
  @IsNotEmpty()
  public contract_type_code_name: string;
  @IsString()
  @IsNotEmpty()
  public contract_status_code: string;
  @IsString()
  @IsNotEmpty()
  public contract_status_code_name: string;
  @IsString()
  @IsNotEmpty()
  public contract_start_date: string;
  @IsString()
  @IsNotEmpty()
  public contract_end_date: string;
  @IsString()
  @IsNotEmpty()
  public instance_name: string;
  @IsString()
  @IsNotEmpty()
  public region_code: string;
  @IsString()
  public platform_type_code: string;
  @IsString()
  public platform_type_code_name: string;
}
