export interface IToken {
  pk: number;
  userPk: number;
  token: string;
  maximumLimit: number;
  expiryTime: number;
  createdAt: Date;
  updatedAt: Date;
}
