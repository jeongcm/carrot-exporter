import { IsString, IsNotEmpty } from 'class-validator';

export class BayesianModelDto {
  @IsString()
  @IsNotEmpty()
  public bayesianModelName: string;

  @IsString()
  public baysianModelDescription: string;

  @IsString()
  public baysianModelResourceType: string;

  @IsString()
  public baysianModelStatus: string;
}
