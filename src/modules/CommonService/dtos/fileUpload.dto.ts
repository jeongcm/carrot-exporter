import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class filteredKey {
  @IsString()
  @IsNotEmpty()
  public Key: string;
}
