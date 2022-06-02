import { IsString, IsNotEmpty } from 'class-validator';

export class CreateIncidentActionAttachmentDto {
  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentName: string;

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentDescription: string;

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentType: 'JS' | 'IM' | 'PD' | 'MO';

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentFilename: string;

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentFileType: string;
}
