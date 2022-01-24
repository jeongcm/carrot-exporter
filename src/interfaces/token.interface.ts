export interface IToken {
  id: string;
  userId:string;
  token:string;
  maximumLimit:number;
  expiryTime:number;
  createdAt:Date;
  updatedAt:Date;
}
