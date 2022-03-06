import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional, IsArray } from 'class-validator';
export class CreateAccessGroupDto {
  @IsString()
  @IsNotEmpty()
  public groupName: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsAlpha()
  @IsNotEmpty()
  public icon: string;

  @IsString()
  @IsOptional()
  public createdBy: string;

  @IsString()
  @IsOptional()
  public updatedBy: string;
}
