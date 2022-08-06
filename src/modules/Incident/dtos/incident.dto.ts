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
  public incidentStatus: '0O' | '1I' | '2R' | '3C';

  @IsString()
  @IsNotEmpty()
  public incidentSeverity: '0U' | '1H' | '2M' | '3L';

  @IsOptional()
  @IsString()
  public incidentDueDate: Date;
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
  public incidentStatus: '0O' | '1I' | '2R' | '3C';

  @IsOptional()
  @IsString()
  public incidentSeverity: '0U' | '1H' | '2M' | '3L';

  @IsOptional()
  @IsString()
  public incidentDueDate: Date;
}

export class UpdateIncidentStatusDto {
  @IsString()
  @IsNotEmpty()
  public incidentStatus: '0O' | '1I' | '2R' | '3C';
}

export class AddAlertReceivedToIncidentDto {
  @IsNotEmpty()
  public alertReceivedIds: string[];
}

export class DropAlertReceivedFromIncidentDto {
  @IsNotEmpty()
  public alertReceivedIds: string[];
}
