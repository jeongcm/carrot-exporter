import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';

export class CreateClusterDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsAlpha()
  @IsNotEmpty()
  public icon: string;

  @IsAlpha()
  @IsNotEmpty()
  public platform: string;

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

  @IsString()
  @IsOptional()
  public isDeleted: boolean;
}
