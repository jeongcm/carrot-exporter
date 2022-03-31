import { IsString, IsOptional, IsNotEmpty, IsDate } from 'class-validator';

export class ApiDto {
  @IsString()
  @IsOptional()
  public createdBy: string;

  @IsString()
  @IsOptional()
  public updatedBy: string;

  @IsDate()
  @IsOptional()
  public createdAt: Date;

  @IsDate()
  @IsOptional()
  public updatedAt: Date;

  @IsString()
  @IsOptional()
  public isDeleted: boolean;

  @IsString()
  @IsNotEmpty()
  public apiName: string;

  @IsString()
  @IsNotEmpty()
  public apiDescription: string;

  @IsString()
  public apiEndPoint1: string;

  @IsString()
  public apiEndPoint2: string;

  @IsString()
  public apiVisibleTF: string;
}