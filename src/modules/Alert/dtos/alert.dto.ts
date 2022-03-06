import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

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

  @IsString()
  public note: string;

  @IsString()
  public description: string;

  @IsString()
  public node: string;

  @IsString()
  public alertRule: string;

  @IsNumber()
  public numberOfOccurrences: number;
}
