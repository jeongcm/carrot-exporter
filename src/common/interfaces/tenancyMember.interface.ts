export interface TenancyMember {
  pk: number;
  id: string;
  userName: string;
  userPk: string;
  userRole: 'owner' | 'member' | 'maintainer';
  tenancyPk: string;
  isActivated: boolean;
  invitedBy: number;
  verificationCode: string;
  isDeleted: boolean;
  tenancyLastAccess: Date;
  createdAt: Date;
  updatedAt: Date;
}
