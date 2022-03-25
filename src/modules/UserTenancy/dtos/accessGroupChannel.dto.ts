import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupChannelDto {
  @IsNotEmpty()
  public accessGroupPk: number;

  @IsNotEmpty()
  public channelPk: number;

  @IsOptional()
  public createdBy: number;

  @IsOptional()
  public updatedBy: number;
}
