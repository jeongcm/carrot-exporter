import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  public messageType: 'MK' |'BL' | 'OP'| 'PY';

  @IsString()
  @IsOptional()
  public messageId: string;

  @IsString()
  @IsNotEmpty()
  public messageVerbiage: string;

  @IsString()
  @IsNotEmpty()
  public customerAccountKey: number;
}
