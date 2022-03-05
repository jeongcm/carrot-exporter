export interface Invitation {
  id: number;
  uuid: string;
  tenancyId: number;
  invitedByUserId: number;
  isActive: boolean;
  isAccepted: boolean;
  acceptedAt: Date;
  isRejected: boolean;
  rejectedAt: Date;
  invitedTo: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}
