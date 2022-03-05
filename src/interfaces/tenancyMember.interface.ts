export interface TenancyMember {
  id: number;
  uuid: string;
  userName: string;
  userId: number;
  userRole: 'owner' | 'member' | 'maintainer';
  tenancyId: number;
  isActivated: boolean;
  invitedBy: string;
  verificationCode: string;
  isDeleted: boolean;
  tenancyLastAccess: Date;
  createdAt: Date;
  updatedAt: Date;
}
