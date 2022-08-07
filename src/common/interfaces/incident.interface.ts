export interface IIncident {
  incidentKey: number;
  incidentId: string;
  assigneeKey: number;
  customerAccountKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  incidentName: string;
  incidentDescription: string;
  incidentStatus: '0O' | '1I' | '2R' | '3C';
  incidentSeverity: '0U' | '1H' | '2M' | '3L';
  incidentDueDate: Date;
  incidentPinned: boolean;
}
