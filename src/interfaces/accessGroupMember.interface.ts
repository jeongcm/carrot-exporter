export interface AccessGroupMember {
  id: string;
  groupId: string;
  memberId: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
}
