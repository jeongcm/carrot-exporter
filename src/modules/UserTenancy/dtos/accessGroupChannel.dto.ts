import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateAccessGroupChannelDto {
  @IsString()
  @IsNotEmpty()
  public accessGroupPk: string;

  @IsString()
  @IsNotEmpty()
  public channelPk: string;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
