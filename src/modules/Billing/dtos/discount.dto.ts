import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class DiscountDto {
  @IsString()
  @IsNotEmpty()
  public discountName: string;

  @IsString()
  @IsNotEmpty()
  public discountDescription: string;

  @IsString()
  @IsNotEmpty()
  public discountBillingSolutionCode: string;

  @IsString()
  @IsNotEmpty()
  public discountType: 'FA' | 'PC';
  // FA ( Fixed Amount )
  // PC ( Percentage )

  @IsNumber()
  @IsNotEmpty()
  public discountValue: number;

  @IsString()
  @IsNotEmpty()
  public discountCurrency: string;

  @IsString()
  @IsNotEmpty()
  public discountRecurringType: 'MO' | 'YR';
  // MO ( monthly )
  // YR ( yearly )

  @IsDateString()
  @IsNotEmpty()
  public discountFrom: Date;

  @IsDateString()
  @IsNotEmpty()
  public discountTo: Date;
}
