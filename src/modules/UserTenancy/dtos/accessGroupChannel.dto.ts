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
  public createdBy: string;

  @IsString()
  @IsOptional()
  public updatedBy: string;
}
