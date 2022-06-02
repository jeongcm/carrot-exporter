import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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

}
export class UpdateBayesianModelDto {
  @IsString()
  @IsOptional()
  public bayesianModelName: string;

  @IsString()
  @IsOptional()
  public bayesianModelDescription: string;

  @IsString()
  @IsOptional()
  public bayesianModelResourceType: string;

}
