import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  @IsNotEmpty()
  public alertName: string;

  @IsString()
  @IsNotEmpty()
  public from: 'LARI' | 'PROMETHEUS';

  @IsString()
  @IsNotEmpty()
  public severity: string;

  @IsString()
  @IsNotEmpty()
  public source: string;

  @IsString()
  @IsNotEmpty()
  public status: 'CLOSED' | 'HIDED' | 'OPEN' | 'REFERENCED';

  @IsString()
  @IsNotEmpty()
  public summary: string;
}
