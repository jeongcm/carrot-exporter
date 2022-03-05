export interface IToken {
  id: number;
  userId: number;
  token: string;
  maximumLimit: number;
  expiryTime: number;
  createdAt: Date;
  updatedAt: Date;
}
