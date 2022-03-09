import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { isDate } from 'util/types';
export class CreateInvitationDto {
  @IsBoolean()
  @IsOptional()
  public isActive: boolean;

  @IsBoolean()
  @IsOptional()
  public isAccepted: boolean;

  @IsString()
  @IsOptional()
  public acceptedAt: Date;

  @IsBoolean()
  @IsOptional()
  public isRejected: boolean;

  @IsString()
  @IsOptional()
  public rejectedAt: Date;

  @IsString()
  @IsOptional()
  public tenancyPk: number;

  @IsString()
  @IsOptional()
  public invitedByUserId: string;

  @IsString()
  @IsOptional()
  public invitedTo: string;

  @IsString()
  @IsOptional()
  public token: string;

  @IsString()
  @IsOptional()
  public createdAt: Date;

  @IsString()
  @IsOptional()
  public updatedAt: Date;
}
