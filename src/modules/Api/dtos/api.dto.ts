import { IsString, IsNotEmpty, IsBoolean, } from 'class-validator';

export class ApiDto {
  @IsString()
  @IsNotEmpty()
  public apiName: string;

  @IsString()
  @IsNotEmpty()
  public apiDescription: string;

  @IsString()
  @IsNotEmpty()
  public apiEndPoint1: string;

  @IsString()
  @IsNotEmpty()
  public apiEndPoint2: string;

  @IsBoolean()
  @IsNotEmpty()
  public apiVisibleTF: Boolean;
}