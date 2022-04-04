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

  public createdAt: Date;

  @IsDate()
  @IsOptional()
  public updatedAt: Date;

  @IsString()
  @IsOptional()
  public createdBy: string;

  @IsString()
  @IsOptional()
  public updatedBy: string;

  @IsString()
  @IsOptional()
  public isDeleted: boolean;
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

  public createdAt: Date;

  @IsString()
  @IsOptional()
  public updatedAt: Date;

  @IsString()
  public createdBy: string;

  @IsString()
  @IsOptional()
  public updatedBy: string;

  @IsString()
  @IsOptional()
  public isDeleted: boolean;
}
