import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupChannelDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupId: string;

  @IsString()
  @IsNotEmpty()
  public channelId: string;

  @IsString()
  @IsOptional()
  public createdBy: string;

  @IsString()
  @IsOptional()
  public updatedBy: string;
}
