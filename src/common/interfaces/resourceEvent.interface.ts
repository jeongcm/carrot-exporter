export interface IResourceEvent {
  resourceEventKey: number;
  resourceEventId: string;
  resourceEventName: string;
  resourceEventDescription: string;
  resourceEventType: string;
  resourceEventNamespace: string;
  resourceEventTargetCreatedAt: Date;
  resourceEventTargetUuid: string;
  resourceEventInvolvedObjectKind: string;
  resourceEventInvolvedObjectName: string;
  resourceEventInvolvedObjectNamespace: string;
  resourceEventReason: string;
  resourceEventMessage: string;
  resourceEventSourceComponent: string;
  resourceEventSourceHost: string;
  resourceEventFirstTimestamp: Date;
  resourceEventLastTimestamp: Date;
  resourceEventCount: number;
  resourceEventContent: any;
  resourceEventPlatformUuid: string;
  customerAccountKey: number;
  resourceGroupUuid: string;
  resourceKey: number;
  resourceGroupKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
