export interface IBillingAccount {
    billingAccountKey: number;
    customerAccountKey: number;
    addressKey: number;
    PaymentTenderKey: number;
    billingAccountId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    billingAccountName: string;
    billingAccountDescription: string;
    billingAccountAutoCollect: boolean;
    billingAccountNextBillDay: Date;
    billingBalance: number;
    billingCurrency: string;
    billingAccountTerm: string;
    billingAccountStatus: string;
  }
  