// roleCode : AD(Admin), ME(Member), AM(Access Group Manager)
export interface IRole {
  roleKey: number;
  roleId: string;
  roleName: string;
  roleCode: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  customerAccountKey: number;
}

export interface IRoleParty {
  rolePartyKey: number;
  rolePartyId: string;
  roleKey: number;
  partyKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
