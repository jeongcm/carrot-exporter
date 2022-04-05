import { IAddress } from './address.interface';

export interface ICustomerAccount {
  customerAccountKey: number;
  customerAccountId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  customerAccountName: string;
  customerAccountDescription: string;
  parentCustomerAccountId: string;
  customerAccountType: string;
  address?: IAddress[];
}
