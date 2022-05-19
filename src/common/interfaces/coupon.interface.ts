export interface ICoupon {
  couponKey: number;
  discountKey: number;
  couponId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  couponFrom: Date;
  couponTo: Date;
  couponCode: string;
  couponName: string;
}
