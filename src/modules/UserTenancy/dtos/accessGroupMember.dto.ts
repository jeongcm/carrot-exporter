import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupId: number;

  @IsString()
  @IsNotEmpty()
  public userId: number;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
