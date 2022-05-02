import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional } from 'class-validator';

export class MetricMetaDto {
  @IsString()
  @IsNotEmpty()
  public metricMetaHash: string;

  @IsString()
  public metricMetaName: string;

  @IsString()
  @IsNotEmpty()
  public metricMetaDescription: string;

  @IsString()
  public metricMetaType: string;

  @IsString()
  public metricMetaUnit: string;

  @IsString()
  public metricMetaTargetInstance: string;

  @IsString()
  public metricMetaTargetJob: string;

  @IsString()
  public metricMetaTargetService: string;

  @IsString()
  public metricMetaTargetPod: string;

  @IsObject()
  public metricMetaTarget: JSON;

  @IsString()
  public metricMetaTargetMetricsPath: string;

  @IsString()
  public resourceId: string;

}

