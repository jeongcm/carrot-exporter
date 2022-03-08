export interface AccessGroup {
  pk: number;
  id: string;
  tenancyPk: string;
  groupName: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
