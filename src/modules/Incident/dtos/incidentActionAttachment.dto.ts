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
  public incidentActionAttachmentType: 'JSON' | 'IMAGE' | 'PDF';

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentFilename: string;

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentFileType: string;
}
