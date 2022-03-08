import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupChannelDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupId: number;

  @IsString()
  @IsNotEmpty()
  public channelId: number;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
