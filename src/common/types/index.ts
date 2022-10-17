export type Platform = 'AWS' | 'baremetal' | 'kubernetes' | 'openstack';

export type ChannelType = 'EMAIL' | 'SLACK' | 'WEBHOOK' | 'PAGEDUTY' | 'SMPT';

export type LogType = 'INDEPENDENT' | 'CHAINED';

export type LogOrigin = 'USER' | 'LARI' | 'SYSTEM';

export type LogStatus = 'CLOSED' | 'HIDDEN' | 'OPEN' | 'REFERENCED';

export type EventStatus = 'CLOSED' | 'HIDDEN' | 'OPEN' | 'REFERENCED';

export type EventFrom = 'LARI' | 'PROMETHEUS';

export type NotificationStatus = 'CR' | 'SM';

export type ResourceType = 'K8' | 'ND' | 'DP' | 'NS' | 'SV' | 'OS' | 'PD' | 'PM' | 'PJ' | 'VM' | 'CT';

export type ResourceTypeLevel1 = 'K8' | 'OS';

export type ResourceTypeLevel2 = 'ND' | 'NS' | 'PJ';

export type ResourceTypeLevel3 = 'PD' | 'SV' | 'PM';

export type ResourceTypeLevel4 = 'CT' | 'VM';

export type incidentStatus = '3O' | '2I' | '1R' | '0C';  //30 Open, 2I In Progress, 1R Resolved, 0C Closed

export type incidentSeverity = '3U' | '2H' | '1M' | '0L';  //3U Urgent, 2H High, 1M Medium, 0L Low
