import { customerAccountType } from '@/common/interfaces/customerAccount.interface';
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

  @IsString()
  @IsOptional()
  public customerAccountType: customerAccountType;

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsString()
  public email: string;
}
