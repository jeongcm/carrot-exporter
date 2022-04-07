import { IsString, IsNotEmpty } from 'class-validator';

export class CreateIncidentActionDto {
  @IsString()
  @IsNotEmpty()
  public incidentActionName: string;

  @IsString()
  @IsNotEmpty()
  public incidentActionDescription: string;

  @IsString()
  @IsNotEmpty()
  public incidentActionStatus: 'EX' | 'RC';
}
