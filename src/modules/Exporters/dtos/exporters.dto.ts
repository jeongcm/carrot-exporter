import { IsString, IsNotEmpty, IsObject } from 'class-validator';

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
    public exporterHelmChartValues: JSON;
    public grafanaDashboard: JSON;
    public exportrType: string;
    public exporterNamespace: string;
    public exporterExporterhubUrl: string;
  }