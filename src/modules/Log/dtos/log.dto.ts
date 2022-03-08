import { LogOrigin, LogStatus, LogType } from '@/common/types';
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
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;

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
