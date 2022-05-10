export interface IDiscount {
  discountKey: number;
  discountId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  discountName: string;
  discountDescription: string;
  discountBillingSolutionCode: string;
  discountType: 'FA' | 'PC';
  discountValue: number;
  discountCurrency: string;
  discountRecurringType: 'MO' | 'YR';
  discountFrom: Date;
  discountTo: Date;
}
