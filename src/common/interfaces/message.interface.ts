

export interface IMessage {
  messageKey: number;
  messageId : string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
  messageType : string;
  customerAccountKey : number;
  messageVerbiage : string;
}