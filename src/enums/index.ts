export type Platform = 'AWS' | 'baremetal' | 'kubernetes';

export type ChannelType = 'EMAIL' | 'SLACK' | 'WEBHOOK';

export type LogType = 'INDEPENDENT' | 'CHAINED';

export type LogOrigin = 'USER' | 'LARI' | 'SYSTEM';

export type LogStatus = 'CLOSED' | 'HIDDEN' | 'OPEN' | 'REFERENCED';

export type EventStatus = 'CLOSED' | 'HIDDEN' | 'OPEN' | 'REFERENCED';

export type EventFrom = 'LARI' | 'PROMETHEUS';
