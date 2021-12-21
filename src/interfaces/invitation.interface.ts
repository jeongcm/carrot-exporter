export interface Invitation {
    id: string;
    isActive: boolean;
    isAccepted: boolean;
    acceptedAt: Date;
    isRejected: boolean;
    rejectedAt: Date;
    tenancyId: string;
    invitedByUserId: string; 
    token: string;
    createdAt:Date;
    updatedAt:Date;
}

