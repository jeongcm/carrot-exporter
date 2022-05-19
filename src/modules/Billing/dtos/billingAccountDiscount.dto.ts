import { IsDateString, IsString } from 'class-validator';

export class BillingAccountDiscountDto {
  @IsString()
  public billingAccountId: string;

  @IsString()
  public discountId: string;

  @IsDateString()
  public billingAccountDiscountFrom: Date;

  @IsDateString()
  public billingAccountDiscountTo: Date;
}
