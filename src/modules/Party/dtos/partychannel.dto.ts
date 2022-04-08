import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, IsNumber } from 'class-validator';

export class CreatePartyChannel {
  @IsNumber()
  @IsNotEmpty()
  public channelKey: number;
}
