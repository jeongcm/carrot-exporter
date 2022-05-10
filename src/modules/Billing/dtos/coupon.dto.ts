import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CouponDto {
  @IsString()
  @IsNotEmpty()
  public discountId: string;

  @IsDateString()
  @IsNotEmpty()
  public couponFrom: Date;

  @IsDateString()
  @IsNotEmpty()
  public couponTo: Date;

  @IsString()
  @IsNotEmpty()
  public couponCode: string;

  @IsString()
  @IsNotEmpty()
  public couponName: string;
}
