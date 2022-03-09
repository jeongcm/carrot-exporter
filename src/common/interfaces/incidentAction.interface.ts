export interface IIncidentAction {
  pk: number;
  id: string;
  incidentPk: number;
  title: string;
  description: string;
  createdBy: number;
  updatedBy: number;
  isDeleted: number;
}
