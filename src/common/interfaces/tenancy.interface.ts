export interface Tenancy {
  pk: number;
  id: string;
  tenancyCode: string;
  tenancyName: string;
  tenancyDescription: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
  isDeleted: boolean;
}
