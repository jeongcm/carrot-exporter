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
  incidentStatus: 'OP' | 'IP' | 'RS' | 'CL';
  incidentSeverity: 'UR' | 'HI' | 'ME' | 'LO';
  incidentDueDate: Date;
  incidentPinned: boolean;
}
// incidentStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
// incidentSeverity: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
