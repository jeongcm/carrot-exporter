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
  public incidentStatus: 'OP' | 'IP' | 'RS' | 'CL';

  @IsString()
  @IsNotEmpty()
  public incidentSeverity: 'UR' | 'HI' | 'ME' | 'LO';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  public incidentStatus: 'OP' | 'IP' | 'RS' | 'CL';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public incidentSeverity: 'UR' | 'HI' | 'ME' | 'LO';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public incidentDueDate: Date;
}

export class UpdateIncidentStatusDto {
  @IsString()
  @IsNotEmpty()
  public incidentStatus: 'OP' | 'IP' | 'RS' | 'CL';
}

export class AddAlertReceivedToIncidentDto {
  @IsNotEmpty()
  public alertReceivedIds: string[];
}

export class DropAlertReceivedFromIncidentDto {
  @IsNotEmpty()
  public alertReceivedIds: string[];
}
