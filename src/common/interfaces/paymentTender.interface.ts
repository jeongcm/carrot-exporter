export interface IPaymentTender {
    paymentTenderKey: number;
    billingAccountKey: number;
    paymentTenderId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    paymentTenderDefault: Boolean;
    paymentTenderDetails1: string;
    paymentTenderDetails2: string;
    paymentTenderDetails3: string;
    paymentTenderDetails4: string;
    isValidated: Boolean;
    validatedAt: Date;
    paymentTenderType:string;
  }