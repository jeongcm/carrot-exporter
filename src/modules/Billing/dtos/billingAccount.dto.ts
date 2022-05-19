import { IsString, IsNotEmpty, IsNumber, IsDateString, IsBoolean, IsDate } from 'class-validator';

export class BillingAccountDto {
  @IsString()
  @IsNotEmpty()
  public billingAccountName: string;

  @IsString()
  public billingAccountDescription: string;

  @IsBoolean()
  public billingAccountAutoCollect: boolean;

  @IsDateString()
  public billingAccountNextBillDay: Date;

  @IsNumber()
  public billingBalance: number;

  @IsString()
  public billingCurrency: string;

  @IsString()
  public billingAccountTerm: string;

  @IsString()
  public billingAccountStatus: string;

  @IsString()
  @IsNotEmpty()
  public addressId: string;
}
