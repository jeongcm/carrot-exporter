import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePartyChannelDto {
  @IsString()
  @IsNotEmpty()
  public channelIds: string[];
}

export class DeletePartyChannelDto {
  @IsString()
  @IsNotEmpty()
  public channelIds: string[];
}
