import { IsString, IsNotEmpty, IsOptional, isNotEmpty } from 'class-validator';

export class CreateBayesianModelDto {
  @IsString()
  @IsNotEmpty()
  public bayesianModelName: string;

  @IsString()
  @IsNotEmpty()
  public bayesianModelDescription: string;

  @IsString()
  @IsNotEmpty()
  public bayesianModelResourceType: string;

  @IsOptional()
  public bayesianModelScoreCard: JSON;

  @IsNotEmpty()
  public resourceGroupUuid: string;

  @IsOptional()
  public version: string;

  @IsOptional()
  public standardModelId: string;
}
export class UpdateBayesianModelDto {
  @IsString()
  @IsOptional()
  public bayesianModelName: string;

  @IsString()
  @IsOptional()
  public bayesianModelId: string;

  @IsString()
  @IsOptional()
  public bayesianModelDescription: string;

  @IsString()
  @IsOptional()
  public bayesianModelResourceType: string;

  @IsNotEmpty()
  public resourceGroupId: string;

  @IsOptional()
  public bayesianModelScoreCard: JSON;

  @IsOptional()
  public version: string;

  @IsOptional()
  public standardModelId: string;
}

export class ProvisionBayesianModelDto {
  @IsString()
  @IsNotEmpty()
  public customerAccountId: string;
}

export class ProvisionBayesianModelforClusterDto {
  @IsString()
  @IsNotEmpty()
  public resourceGroupId: string;
}
