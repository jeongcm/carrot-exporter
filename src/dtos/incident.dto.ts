import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
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
  public relatedAlertIds: [number];

  @IsString()
  @IsNotEmpty()
  public title: string;
}
