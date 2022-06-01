export interface IIncidentActionAttachment {
  incidentActionAttachmentKey: number;
  incidentActionAttachmentId: string;
  incidentActionKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  incidentActionAttachmentName: string;
  incidentActionAttachmentDescription: string;
  incidentActionAttachmentType: 'JSON' | 'IMAGE' | 'PDF';
  incidentActionAttachmentFilename: string;
  incidentActionAttachmentFileType: string;
  incidentActionAttachmentPath: JSON;
}

export interface IIncidentActionAttachmentResponse {
  incidentActionAttachmentId: string;
  updatedBy: string;
  updatedAt: Date;
  incidentActionAttachmentName: string;
  incidentActionAttachmentDescription: string;
  incidentActionAttachmentType: 'JSON' | 'IMAGE' | 'PDF';
  incidentActionAttachmentFilename: string;
  incidentActionAttachmentFileType: string;
  incidentActionAttachmentPath: JSON;
}
