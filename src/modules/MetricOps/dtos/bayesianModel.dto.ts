import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBayesianModelDto {
  @IsString()
  @IsNotEmpty()
  public bayesianModelName: string;

  @IsString()
  @IsNotEmpty()
  public baysianModelDescription: string;

  @IsString()
  @IsNotEmpty()
  public baysianModelResourceType: string;

}
export class UpdateBayesianModelDto {
  @IsString()
  public bayesianModelName: string;

  @IsString()
  public baysianModelDescription: string;

  @IsString()
  public baysianModelResourceType: string;

}
