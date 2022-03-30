import { IsString, IsOptional, IsNotEmpty, IsDate } from 'class-validator';

export class CommonCodeDto {
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
  public commonCodeDescription: string;

  @IsString()
  public commonCodeDisplayENG: string;

  @IsString()
  public commonCodeDisplayKOR: string;
}