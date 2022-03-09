import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupPk: number;

  @IsString()
  @IsNotEmpty()
  public userPk: number;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
