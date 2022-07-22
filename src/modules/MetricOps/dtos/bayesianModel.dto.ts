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
  public bayesianModelScoreCard:JSON

  @IsString()
  @IsNotEmpty()
  public bayesianModelClusterId: string;
 
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

  @IsString()
  @IsOptional()
  public bayesianModelClusterId: string;


  @IsOptional()
  public bayesianModelScoreCard:JSON


}
