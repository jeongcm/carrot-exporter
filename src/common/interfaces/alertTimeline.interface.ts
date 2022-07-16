export interface IAlertTimeline {
  alertTimelineId: string;
  alertTimelineKey: number;
  alertTimelineHash: string;
  alertTimelineState: string; // 'firing' | 'pending'
  alertTimelineStartAt: Date;
  alertTimelineEndAt: Date;
  alertTimelineLastCheckedAt: Date;
  customerAccountKey: number;
  resourceGroupKey: number;
  resourceGroupName: string;
  resourceGroupUuid: string;
  alertReceivedIdEnd: string;
  alertReceivedIdStart: string;
  alertReceivedName: string;
  alertReceivedNamespace: string;
  alertReceivedNode: string;
  alertReceivedService: string;
  alertReceivedPod: string;
  alertReceivedInstance: string;
  alertRuleId: string;
  alertRuleKey: number;
  alertRuleName: string;
  alertRuleGroup: string;
  createdBy: string;
  updatedBy: string;
  deletedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
