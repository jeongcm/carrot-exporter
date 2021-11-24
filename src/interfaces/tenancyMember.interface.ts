export interface TenancyMember {
  id: number;
  user: string;
  userId: string;
  tenancyId: number;
  isActivated: boolean;
  isSelected: boolean;
  isDeleted: boolean;
  tenancyLastAccess: Date;
  createdAt: Date;
  updatedAt: Date;
}
