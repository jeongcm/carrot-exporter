export interface IToken {
  pk: number;
  userPk: string;
  token: string;
  maximumLimit: number;
  expiryTime: number;
  createdAt: Date;
  updatedAt: Date;
}
