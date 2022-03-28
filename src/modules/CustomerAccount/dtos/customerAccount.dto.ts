import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerAccountDto {
  @IsString()
  public customerAccountName: string;

  @IsString()
  @IsOptional()
  public customerAccountDescription: string;

  @IsString()
  @IsOptional()
  public parentCustomerAccountId: string;
}
