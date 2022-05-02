import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public partyName: string;

  @IsString()
  @IsOptional()
  public partyDescription: string;

  @IsString()
  @IsOptional()
  public parentPartyId: string;

  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsString()
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @IsOptional()
  public mobile: string;

  @IsString()
  @IsOptional()
  public password: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public customerAccountId: string;

  @IsString()
  @IsNotEmpty()
  public partyUserStatus: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public partyName: string;

  @IsOptional()
  @IsString()
  public partyDescription: string;

  @IsOptional()
  @IsString()
  public parentPartyId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  public mobile: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public partyUserStatus: string;
}

export class CreateAccessGroupDto {
  @IsString()
  @IsNotEmpty()
  public partyName: string;

  @IsString()
  @IsOptional()
  public partyDescription: string;

  @IsString()
  @IsOptional()
  public parentPartyId: string;
}

export class AddUserAccessGroupDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  public partyIds: string[];
}

export class AddResourceToAccessGroupDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  public resourceIds: string[];
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}
