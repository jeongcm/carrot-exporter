import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupChannelDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupPk: number;

  @IsString()
  @IsNotEmpty()
  public channelPk: number;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
