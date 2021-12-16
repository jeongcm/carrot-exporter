export interface IIncident {
  id: number;
  tenancyId: number;
  assigneeId: string;
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
