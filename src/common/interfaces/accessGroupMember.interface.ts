export interface AccessGroupMember {
  id: number;
  uuid: string;
  accessGroupId: number;
  userId: number;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
