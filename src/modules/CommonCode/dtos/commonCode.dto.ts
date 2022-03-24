import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDate } from 'class-validator';

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
  public description: string;

  @IsString()
  public displayEng: string;

  @IsString()
  public displayKOR: string;
}