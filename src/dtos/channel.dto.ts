import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  public channelType: string;
  
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsAlpha()
  @IsNotEmpty()
  public configJSON: string;

  @IsString()
  @IsOptional()
  public createdAt: Date;

  @IsString()
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
