export interface IIncidentAction {
  pk: number;
  id: string;
  incidentPk: string;
  title: string;
  description: string;
  createdBy: number;
  updatedBy: number;
  isDeleted: number;
}
