export interface IToken {
  tokenKey: number;
  tokenId: string;
  partyUserKey: number;
  token: string;
  maximumLimit: number;
  expiryTime: number;
  createdAt: Date;
  updatedAt: Date;
}
