import { UserRole } from '@common/enums';
export interface TenancyMember {
  pk: number;
  id: string;
  userName: string;
  userPk: number;
  userRole: UserRole;
  tenancyPk: number;
  isActivated: boolean;
  invitedBy: number;
  verificationCode: string;
  isDeleted: boolean;
  tenancyLastAccess: Date;
  createdAt: Date;
  updatedAt: Date;
}
