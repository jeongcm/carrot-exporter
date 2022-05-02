import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsOptional } from 'class-validator';

export class MetricReceivedDto {
  @IsString()
  @IsNotEmpty()
  public metricReceivedHash: string;

  @IsString()
  @IsNotEmpty()
  public metricReceivedName: string;

  @IsString()
  @IsNotEmpty()
  public metricReceivedMetricInstance: string;

  @IsString()
  @IsNotEmpty()
  public metricReceivedMetricJob: string;

  @IsString()
  public metricReceivedMetricService: string;

  @IsString()
  public metricReceivedMetricPod: string;

  @IsObject()
  public metricReceivedMetric: JSON;

  @IsString()
  public metricReceivedMetricValue: string;

}

