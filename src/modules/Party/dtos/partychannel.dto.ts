import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class AddChannelToAccessGroupDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  public channelIds: string[];
}

export class RemoveChannelFromAccessGroupDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  public channelIds: string[];
}
