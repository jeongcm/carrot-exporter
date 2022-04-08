export interface IAlertReceived {
    alertReceivedKey: number;
    customerAccountKey: number;
    alertRuleKey: number;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    alertReceivedName: string;
    alertReceivedValue: string;
    alertReceivedState: string;
    alertReceivedNamespace: string;
    alertReceivedSeverity: string;
    alertReceivedDescription: string;
    alertReceivedSummary: string;
    alertReceivedActiveAt: Date;
    alertReceivedNode: string;
    alertReceivedService: string;
    alertReceivedPod: string;
    alertReceivedInstance: string;
    alertReceivedLabels: JSON;
    alertReceivedPinned: number;
  }