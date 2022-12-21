import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsOptional()
  public assigneeId: string;

  @IsString()
  @IsNotEmpty()
  public incidentName: string;

  @IsString()
  @IsNotEmpty()
  public incidentDescription: string;

  @IsString()
  @IsNotEmpty()
  public incidentStatus: '3O' | '2I' | '1R' | '0C';

  @IsString()
  @IsNotEmpty()
  public incidentSeverity: '3U' | '2H' | '1M' | '0L';

  @IsOptional()
  @IsString()
  public incidentDueDate: Date;

  @IsOptional()
  @IsString()
  public anomalyMonitoringTargetId: string;
}

export class UpdateIncidentDto {
  @IsOptional()
  @IsString()
  public assigneeId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public incidentName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public incidentDescription: string;

  @IsOptional()
  @IsString()
  public incidentStatus: '3O' | '2I' | '1R' | '0C';

  @IsOptional()
  @IsString()
  public incidentSeverity: '3U' | '2H' | '1M' | '0L';

  @IsOptional()
  @IsString()
  public incidentDueDate: Date;
}

export class UpdateIncidentStatusDto {
  @IsString()
  @IsNotEmpty()
  public incidentStatus: '3O' | '2I' | '1R' | '0C';
}

export class AddAlertReceivedToIncidentDto {
  @IsNotEmpty()
  public alertReceivedIds: string[];
}

export class DropAlertReceivedFromIncidentDto {
  @IsNotEmpty()
  public alertReceivedIds: string[];
}
