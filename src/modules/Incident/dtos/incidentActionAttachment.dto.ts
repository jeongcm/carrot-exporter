import { IsString, IsNotEmpty, IsOptional, IsJSON } from 'class-validator';

export class CreateIncidentActionAttachmentDto {
  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentName: string;

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentDescription: string;

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentType: 'JS' | 'IM';

  @IsString()
  @IsNotEmpty()
  public incidentActionAttachmentFilename: string;

  @IsOptional()
  public incidentActionAttachmentBLOB: Blob;

  @IsOptional()
  // @IsJSON()
  public incidentActionAttachmentJSON: JSON;
}
