export interface Notification {
  notificationKey: number;
  notificationId: string;
  partyKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  notificationStatus: string;
  notificationStatutsUpdatedAt: Date;
  customerAccountKey: number;
  notificationChannelType: string;
  notificationType: string;
  notificationChannel: string;
  notificationMessage: JSON;
}

export interface AlertNotification {
  alertNotificationKey: number;
  alertNotificationId: string;
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
