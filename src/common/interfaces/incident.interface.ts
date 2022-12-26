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
  incidentStatus: '3O' | '2I' | '1R' | '0C';
  incidentSeverity: '3U' | '2H' | '1M' | '0L';
  incidentDueDate: Date;
  incidentPinned: boolean;
  evaluationKey: number;
}
