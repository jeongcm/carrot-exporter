import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsOptional()
  public assigneeId: string;

  @IsString()
  @IsNotEmpty()
  public dueDate: Date;

  @IsString()
  @IsNotEmpty()
  public note: string;

  @IsNotEmpty()
  public priority: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT';

  @IsString()
  @IsNotEmpty()
  public status: 'CLOSED' | 'IN_PROGRESS' | 'OPEN' | 'RESOLVED';

  @IsOptional()
  public relatedAlertIds: [string];

  @IsOptional()
  public actions: { description: string; title: string }[];

  @IsString()
  @IsNotEmpty()
  public title: string;
}

export class UpdateIncidentStatusDto {
  @IsString()
  @IsNotEmpty()
  public status: 'CLOSED' | 'IN_PROGRESS' | 'OPEN' | 'RESOLVED';
}

export class UpdateIncidentDto {
  @IsString()
  @IsOptional()
  public assigneeId: string;

  @IsString()
  @IsNotEmpty()
  public dueDate: Date;

  @IsString()
  @IsNotEmpty()
  public note: string;

  @IsNotEmpty()
  public priority: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT';

  @IsString()
  @IsOptional()
  public status: 'CLOSED' | 'IN_PROGRESS' | 'OPEN' | 'RESOLVED';

  @IsOptional()
  public relatedAlertIds: [string];

  @IsOptional()
  public actions: { description: string; title: string }[];

  @IsString()
  @IsNotEmpty()
  public title: string;
}

export class CreateRelatedAlertDto {
  @IsNotEmpty()
  public relatedAlertIds: [string];
}
