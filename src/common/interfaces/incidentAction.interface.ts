export interface IIncidentAction {
  incidentActionKey: number;
  incidentActionId: string;
  incidentKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  incidentActionName: string;
  incidentActionDescription: string;
  incidentActionStatus: 'EX' | 'RC';
  incidentActionExecutedAt: Date;
}
// incidentActionStatus: 'Executed' | 'Recommended';
