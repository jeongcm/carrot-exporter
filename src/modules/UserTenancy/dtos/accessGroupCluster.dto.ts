import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupClusterDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupPk: string;

  @IsString()
  @IsNotEmpty()
  public clusterPk: string;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
