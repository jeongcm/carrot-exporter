export interface AccessGroup {
  pk: number;
  id: string;
  tenancyPk: number;
  groupName: string;
  description: string;
  isDeleted: boolean;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
