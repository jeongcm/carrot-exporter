import { LogOrigin, LogStatus, LogType } from '@/types';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public from: LogOrigin;

  @IsString()
  @IsNotEmpty()
  public type: LogType;

  @IsString()
  @IsNotEmpty()
  public status: LogStatus;

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

  @IsBoolean()
  @IsOptional()
  public isActive: boolean;

  @IsBoolean()
  @IsOptional()
  public hasDescriptiveLog: boolean;

  @IsString()
  @IsNotEmpty()
  public descriptiveLog: string;

  @IsString()
  @IsNotEmpty()
  public message: string;
}
