import { IsString, IsNotEmpty } from 'class-validator';

export class CreateActionDto {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public description: string;
}
