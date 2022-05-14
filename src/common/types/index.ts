export type Platform = 'AWS' | 'baremetal' | 'kubernetes';

export type ChannelType = 'EMAIL' | 'SLACK' | 'WEBHOOK' | 'PAGEDUTY' | 'SMPT';

export type LogType = 'INDEPENDENT' | 'CHAINED';

export type LogOrigin = 'USER' | 'LARI' | 'SYSTEM';

export type LogStatus = 'CLOSED' | 'HIDDEN' | 'OPEN' | 'REFERENCED';

export type EventStatus = 'CLOSED' | 'HIDDEN' | 'OPEN' | 'REFERENCED';

export type EventFrom = 'LARI' | 'PROMETHEUS';

export type NotificationStatus = "CR" | "SM";

export type ResourceType = 'K8' | 'ND' | 'DP' | 'NS' | 'SV' | 'OP' | 'PD' | 'PM' | 'PJ' | 'VM' | 'CT';

export type ResourceTypeLevel1 = 'K8' | 'OP';

export type ResourceTypeLevel2 = 'ND' | 'NS' | 'PJ';

export type ResourceTypeLevel3 = 'PD' | 'SV' | 'PM';

export type ResourceTypeLevel4 = 'CT' | 'VM';
