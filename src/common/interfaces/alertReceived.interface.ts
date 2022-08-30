import { IAlertRule } from './alertRule.interface';
import { IResourceGroup } from './resourceGroup.interface';
export interface IAlertReceived {
  alertReceivedKey: number;
  customerAccountKey: number;
  alertRuleKey: number;
  alertReceivedId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  alertReceivedUiFlag: number;
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
  alertReceivedPinned: boolean;
  alertReceivedContainer: string;
  alertReceivedEndpoint: string;
  alertReceivedReason: string;
  alertReceivedUid: string;
  alertReceivedHash: string;
}

export interface IAlertReceivedDetailed extends IAlertReceived {
  resourceGroup: IResourceGroup;
  alertRule: IAlertRule;
}

export interface IAlertRuleId {
  alertRuleId: string;
}

export interface IAlertRuleSettingData {
  alertNotiSettingEnabled: boolean;
  alertNotiSettingSilentFrom: Date;
  alertNotiSettingSilentUnti: Date;
  alertRuleId: number
}
