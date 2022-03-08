export interface Invitation {
  pk: number;
  id: string;
  tenancyPk: string;
  invitedByUserId: string;
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
