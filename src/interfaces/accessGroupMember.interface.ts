export interface AccessGroupMember {
  id: number;
  accessGroupId: number;
  userId: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
}
