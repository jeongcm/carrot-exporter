import { IsString, IsNotEmpty } from 'class-validator';

export class CommonCodeDto {
  @IsString()
  @IsNotEmpty()
  public commonCodeDescription: string;

  @IsString()
  @IsNotEmpty()
  public commonCodeDisplayENG: string;

  @IsString()
  @IsNotEmpty()
  public commonCodeDisplayKOR: string;
}
