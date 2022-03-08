import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupPk: string;

  @IsString()
  @IsNotEmpty()
  public userPk: string;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
