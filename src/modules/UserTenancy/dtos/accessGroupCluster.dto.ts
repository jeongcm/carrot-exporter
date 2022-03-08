import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupClusterDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupId: number;

  @IsString()
  @IsNotEmpty()
  public clusterId: number;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
