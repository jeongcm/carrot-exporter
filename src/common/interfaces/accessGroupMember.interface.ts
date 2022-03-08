export interface AccessGroupMember {
  pk: number;
  id: string;
  accessGroupPk: string;
  userPk: string;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
