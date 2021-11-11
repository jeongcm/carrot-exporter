import { IsString, IsEmail, IsNotEmpty, IsAlpha } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public loginId: string;

  @IsString()
  public loginPw: string;

  @IsAlpha()
  public name: string;
}
