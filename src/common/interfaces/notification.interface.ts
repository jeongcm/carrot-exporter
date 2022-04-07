export interface Notification {
    notificationKey: number;
    notificationId: string;
    partyChannelKey: number;
    partyKey: number;
    messageKey: number;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    notificationStatus: string;
    notificationStatutsUpdatedAt: Date;
    customerAccountKey: number;
  }