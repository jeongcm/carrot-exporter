export interface AccessGroupMember {
  id: string;
  accessGroupId: string;
  userId: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
}
