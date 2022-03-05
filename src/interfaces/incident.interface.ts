export interface IIncident {
  id: number;
  uuid: string;
  tenancyId: number;
  assigneeId: number;
  title: string;
  note: string;
  status: 'CLOSED' | 'IN_PROGRESS' | 'OPEN' | 'RESOLVED';
  priority: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT';
  dueDate: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: number;
  pinned: string;
}
