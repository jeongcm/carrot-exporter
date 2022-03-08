export interface IIncidentAction {
  id: number;
  uuid: string;
  incidentId: number;
  title: string;
  description: string;
  createdBy: number;
  updatedBy: number;
  isDeleted: number;
}
