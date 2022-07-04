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

export interface AlertNotification {
  alertNotificationKey: number;
  alertNotificationId: string;
  partyChannelKey: number;
  partyKey: number;
  templateKey: number;
  contentJson: any;
  queueId: string;
  queueStatus: string;
  queueStatusUpdatedAt: Date;
  alertNotificationStatus: string;
  alertNotificationStatutsUpdatedAt: Date;
  customerAccountKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
