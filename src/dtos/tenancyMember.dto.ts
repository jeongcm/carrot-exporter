import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';


export class CreateTenancyMemberDto {

  @IsString()
  public userName: string;

  @IsString()
  public userId: string;

  @IsString()
  @IsNotEmpty()
  public userRole:'owner' | 'member' | 'maintainer';

  @IsString()
  public tenancyId: string;

  @IsString()@IsOptional()
  public isActivated: string;

  @IsString()@IsOptional()
  public verificationCode: string;

  @IsString()@IsOptional()
  public isDeleted: string;

  @IsString()@IsOptional()
  public createdAt: Date;

  @IsString()@IsOptional()
  public updatedAt: Date;

  @IsString()@IsOptional()
  public invitedBy: string;

}
export class updateTenancyMemberDto {

  @IsString()
  @IsOptional()
  public userName: string;

  @IsString()
  @IsOptional()
  public userId: string;

  @IsString()
  @IsOptional()
  public userRole:'owner' | 'member' | 'maintainer';

  @IsString()
  public tenancyId: string;

  @IsString()@IsOptional()
  public isActivated: string;

  @IsString()@IsOptional()
  public verificationCode: string;

  @IsString()@IsOptional()
  public isDeleted: string;

  @IsString()@IsOptional()
  public createdAt: Date;

  @IsString()@IsOptional()
  public updatedAt: Date;

  @IsString()@IsOptional()
  public invitedBy: string;

}