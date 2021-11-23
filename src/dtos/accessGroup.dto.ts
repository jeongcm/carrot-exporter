import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';

export class CreateAccessGroupDto {

  @IsString()@IsNotEmpty()
  public groupName: string;

  @IsString()@IsNotEmpty()
  public description: string;

  @IsAlpha()@IsNotEmpty()
  public icon: string;
}
