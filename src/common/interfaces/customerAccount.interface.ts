import { IAddress } from './address.interface';

export type customerAccountType = 'ST' | 'SM' | 'EN' | 'IA' | 'CO' | 'PA';
/**
 * ST : Startup 스타트업
 * SM : SMB 중소기업
 * EN : Enterprise 대기업
 * CO : Corprate general 일반기업
 * IA : Internal Account 내부계정
 * PA : Partner
 */

export interface ICustomerAccount {
  customerAccountKey: number;
  customerAccountId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  customerAccountName: string;
  customerAccountDescription: string;
  parentCustomerAccountId: string;
  customerAccountType: customerAccountType;
  address?: IAddress[];
  customerAccountApiKey: string;
  customerAccountApiKeyIssuedAt: Date;
  externalBillingCustomerId: string;
}

export interface ICustomerAccoutType {
  customerAccountType: customerAccountType;
}
