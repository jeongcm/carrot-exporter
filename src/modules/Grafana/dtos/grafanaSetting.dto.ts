import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGrafanaSettingDto {
  @IsString()
  @IsOptional()
  public grafanaUrl: string;

  @IsString()
  public grafanaType: string;

  @IsString()
  @IsOptional()
  public configJson: string;
}

export class UpdateGrafanaSettingDto {
  @IsString()
  @IsOptional()
  public grafanaUrl: string;

  @IsString()
  public grafanaType: string;

  @IsString()
  @IsOptional()
  public configJson: string;
}
