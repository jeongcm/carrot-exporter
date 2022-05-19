import { IsString, IsBoolean} from 'class-validator';

export class PaymentTenderDto {
  @IsBoolean()
  public paymentTenderDefault: boolean;

  @IsString()
  public paymentTenderDetails1: string;

  @IsString()
  public paymentTenderDetails2: string;

  @IsString()
  public paymentTenderDetails3: string;

  @IsString()
  public paymentTenderDetails4: string;

  @IsBoolean()
  public isValidated: boolean;

  @IsString()
  public paymentTenderType: 'VI' | 'MS' | 'AM' | 'PP';

  @IsString()
  public billingAccountId: string;
}
