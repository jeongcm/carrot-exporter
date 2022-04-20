import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, IsNumber } from 'class-validator';

export class CreatePartyChannel {
  @IsString()
  @IsNotEmpty()
  public channelId: string;
}
