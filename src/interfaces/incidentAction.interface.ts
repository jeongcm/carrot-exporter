export interface IIncidentAction {
  id: number;
  incidentId: number;
  title: string;
  description: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: number;
}
