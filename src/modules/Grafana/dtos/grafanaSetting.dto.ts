import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGrafanaSettingDto {
  @IsString()
  public grafanaUrl: string;

  @IsString()
  public configJson: string;
}

export class UpdateGrafanaSettingDto {
  @IsString()
  public grafanaUrl: string;

  @IsString()
  public configJson: string;
}
