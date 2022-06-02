import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMonitoringTargetDto {
    @IsString()
    @IsNotEmpty()
    public anomalyMonitoringTargetName : string;
  
    @IsString()
    @IsNotEmpty()
    public anomalyMonitoringTargetDescription : string;

    @IsString()
    @IsNotEmpty()
    public bayesianModelId : string;

    @IsString()
    @IsNotEmpty()
    public resourceId : string;
  
    @IsString()
    @IsOptional()
    public anomalyMonitoringTargetStatus: string;
  
  }

  export class UpdateMonitoringTargetDto {
    @IsString()
    @IsOptional()
    public anomalyMonitoringTargetName : string;

    @IsString()
    @IsOptional()
    public resourceId : string;
  
    @IsString()
    @IsOptional()
    public anomalyMonitoringTargetDescription : string;
  
    @IsString()
    @IsOptional()
    public anomalyMonitoringTargetStatus: string;
  
  }