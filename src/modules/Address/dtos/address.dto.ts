import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString({ message: 'addr1 is required' })
  public addr1: string;

  @IsString()
  @IsOptional()
  public addr2: string;

  @IsString({ message: 'city is required' })
  public city: string;

  @IsString()
  @IsOptional()
  public state: string;

  @IsString()
  @IsOptional()
  public country: string;

  @IsString({ message: 'zipcode is required' })
  public zipcode: string;

  @IsString()
  @IsOptional()
  public addressName: string;
}
