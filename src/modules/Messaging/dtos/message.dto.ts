import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  public messageType: string;

  @IsString()
  @IsNotEmpty()
  public messageId: string;

  @IsString()
  @IsNotEmpty()
  public messageVerbiage: string;

  @IsString()
  @IsNotEmpty()
  public customerAccountKey: number;
}
