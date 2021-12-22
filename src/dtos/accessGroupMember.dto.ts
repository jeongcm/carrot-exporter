import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupId: string;

  @IsString()
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @IsOptional()
  public createdBy: string;

  @IsString()
  @IsOptional()
  public updatedBy: string;
}
