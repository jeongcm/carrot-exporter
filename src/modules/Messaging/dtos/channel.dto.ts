import { IsString, IsArray, IsNotEmpty, IsObject } from 'class-validator';

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

export class RemoveChannelDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  public channelIds: string[];
}
