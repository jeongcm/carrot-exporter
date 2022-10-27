import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class ExporterDto {
  @IsNotEmpty()
  public exporterName: string;
  @IsNotEmpty()
  public exporterDescription: string;
  @IsNotEmpty()
  public exporterHelmChartName: string;
  @IsNotEmpty()
  public exporterHelmChartRepoUrl: string;
  @IsNotEmpty()
  public exporterHelmChartVersion: string;
  @IsObject()
  @IsOptional()
  public exporterHelmChartValues: JSON;
  @IsOptional()
  public grafanaDashboard: JSON;
  @IsOptional()
  public exportrType: string;
  @IsOptional()
  public exporterNamespace: string;
  @IsOptional()
  public exporterExporterhubUrl: string;
  @IsOptional()
  public defaultChartYn: Boolean;

}
