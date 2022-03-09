export interface AccessGroupMember {
  pk: number;
  id: string;
  accessGroupPk: number;
  userPk: number;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
