import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()@IsNotEmpty()
  public loginId: string;

  @IsString()@IsNotEmpty()
  public loginPw: string;

  @IsAlpha()@IsNotEmpty()
  public username: string;

  @IsString()@IsOptional()
  public firstName: string;

  @IsString()@IsOptional()
  public lastName: string;

  @IsString()@IsOptional()
  public mobile: string;

  @IsString()@IsOptional()
  public photo: string;
}

export class LoginUserDto {
  @IsEmail()
  public loginId: string;

  @IsString()
  public loginPw: string;

}
