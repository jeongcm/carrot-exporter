import { IsString, IsOptional, IsNotEmpty, IsDate } from 'class-validator';

export class ApiDto {
  @IsString()
  @IsNotEmpty()
  public apiName: string;

  @IsString()
  @IsNotEmpty()
  public apiDescription: string;

  @IsString()
  @IsOptional()
  public apiEndPoint1: string;

  @IsString()
  @IsOptional()
  public apiEndPoint2: string;

  @IsString()
  @IsOptional()
  public apiVisibleTF: string;
}