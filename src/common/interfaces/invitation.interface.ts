export interface IInvitation {
  invitationKey: number;
  invitationId: string;
  customerAccountKey: number;
  messageKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  invitedByPartyKey: number;
  isActive: boolean;
  isAccepted: boolean;
  acceptedAt: Date;
  isRejected: boolean;
  rejectedAt: Date;
  invitedTo: string;
  token: string;
  customMsg: string;
}

export interface IAcceptInvitation {
  isActive: boolean;
  isAccepted: boolean;
  acceptedAt: Date;
}

export interface IRejectInvitation {
  isActive: boolean;
  isRejected: boolean;
  rejectedAt: Date;
}