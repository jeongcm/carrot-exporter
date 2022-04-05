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

}
