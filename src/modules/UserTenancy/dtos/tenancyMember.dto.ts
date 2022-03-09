import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';
import { UserRole } from '@common/enums/index';

export class CreateTenancyMemberDto {
  @IsString()
  @IsNotEmpty()
  public userRole: UserRole;
}
export class updateTenancyMemberDto {
  @IsString()
  @IsOptional()
  public userName: string;

  @IsString()
  @IsOptional()
  public userPk: number;

  @IsString()
  @IsOptional()
  public userRole: UserRole;

  @IsString()
  public tenancyPk: number;

  @IsString()
  @IsOptional()
  public isActivated: string;

  @IsString()
  @IsOptional()
  public verificationCode: string;

  @IsString()
  @IsOptional()
  public isDeleted: string;

  @IsString()
  @IsOptional()
  public createdAt: Date;

  @IsString()
  @IsOptional()
  public updatedAt: Date;

  @IsString()
  @IsOptional()
  public invitedBy: string;
}
