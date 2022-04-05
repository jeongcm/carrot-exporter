

export interface IMessage {
  messageKey: number;
  messageId : string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
  messageType : 'MK' |'BL' | 'OP'| 'PY'; // message type - MK: marketing, BL: billing, OP: operations, PY: payment in commonCode
  customerAccountKey : number;
  messageVerbiage : string;
}