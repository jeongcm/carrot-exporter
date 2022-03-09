import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupClusterDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupPk: number;

  @IsString()
  @IsNotEmpty()
  public clusterPk: number;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
