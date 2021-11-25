import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';


export class CreateTenancyMemberDto {
  @IsEmail()@IsOptional()
  public prdCode: string;

  @IsString()
  public userName: string;

  @IsAlpha()
  public userId: string;

  @IsString()@IsOptional()
  public tenancyId: string;

  @IsString()@IsOptional()
  public isActivated: string;

  @IsString()@IsOptional()
  public isSelected: string;

  @IsString()@IsOptional()
  public isDeleted: string;

  @IsString()@IsOptional()
  public createdAt: string;

  @IsString()@IsOptional()
  public updatedAt: string;

  @IsString()@IsOptional()
  public createdBy: string;

  @IsString()@IsOptional()
  public updatedBy: string;
}