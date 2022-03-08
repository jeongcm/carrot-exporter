export interface Tenancy {
  id: number;
  uuid: string;
  tenancyCode: string;
  tenancyName: string;
  tenancyDescription: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
  isDeleted: boolean;
}
