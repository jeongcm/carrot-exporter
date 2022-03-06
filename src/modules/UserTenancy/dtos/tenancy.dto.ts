import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';

export class CreateTenancyDto {
  @IsString()
  public tenancyCode: string;

  @IsString()
  public tenancyName: string;

  @IsString()
  @IsOptional()
  public tenancyDescription: string;

  @IsString()
  @IsOptional()
  public tenancyLastAccess: string;

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
