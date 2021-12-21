import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupClusterDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupId: string;

  @IsString()
  @IsNotEmpty()
  public clusterId: string;

  @IsString()
  @IsOptional()
  public createdBy: string;

  @IsString()
  @IsOptional()
  public updatedBy: string;
}
