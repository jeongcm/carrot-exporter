export interface IIncident {
  pk: number;
  id: string;
  tenancyPk: number;
  assigneePk: number;
  title: string;
  note: string;
  status: 'CLOSED' | 'IN_PROGRESS' | 'OPEN' | 'RESOLVED';
  priority: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT';
  dueDate: Date;
  createdBy: number;
  updatedBy: number;
  isDeleted: number;
  pinned: string;
}
