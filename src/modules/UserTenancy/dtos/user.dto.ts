import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public loginPw: string;

  @IsAlpha()
  @IsNotEmpty()
  public username: string;

  @IsString()
  @IsOptional()
  public firstName: string;

  @IsString()
  @IsOptional()
  public lastName: string;

  @IsString()
  @IsOptional()
  public mobile: string;

  @IsString()
  @IsOptional()
  public photo: string;

  @IsOptional()
  public isEmailValidated: boolean;

  @IsOptional()
  public emailValidatedOn: Date;

  @IsString()
  @IsOptional()
  public token: string;

  @IsString()
  @IsOptional()
  public currentTenancyPk: number;
}

export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public loginPw: string;
}
