import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional, IsJSON, IsObject, IsDate } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  public channelType: string;

  @IsString()
  @IsNotEmpty()
  public channelName: string;

  @IsString()
  @IsNotEmpty()
  public channelDescription: string;

  @IsObject()
  public channelAdaptor: JSON;

  @IsDate()
  @IsOptional()
  public updatedAt: Date;

  @IsString()
  @IsOptional()
  public updatedBy: string;

}

export class UpdateChannelDto {

  @IsString()
  @IsNotEmpty()
  public channelType: string;

  @IsString()
  @IsNotEmpty()
  public channelName: string;

  @IsString()
  @IsNotEmpty()
  public channelDescription: string;

  // @IsAlpha()
  // @IsString()
  // @IsNotEmpty()
  @IsObject()
  public channelAdaptor: JSON;

  @IsString()
  @IsOptional()
  public updatedAt: Date;


  @IsString()
  @IsOptional()
  public updatedBy: string;

}
