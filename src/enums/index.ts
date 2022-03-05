// RYAN: if there are one or more value under a "type" it's always better to use an enum
// instead of type a = 'a' | 'b'

export enum SocialLoginEnum {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
}

export enum PlatformEnum {
  AWS = 'AWS',
  BAREMETAL = 'BAREMETAL',
  KUBERNETES = 'KUBERNETES',
}

export enum ChannelTypeEnum {
  EMAIL,
  SLACK,
  WEBHOOK,
}

console.log(ChannelTypeEnum.EMAIL);

export enum LogType {
  INDEPENDENT,
  CHAINED,
}

export enum LogOrigin {
  USER,
  LARI,
  SYSTEM,
}

export enum LogStatus {
  CLOSED,
  HIDDEN,
  OPEN,
  REFERENCED,
}

export enum EventStatus {
  CLOSED,
  HIDDEN,
  OPEN,
  REFERENCED,
}

export enum EventFrom {
  LARI,
  PROMETHEUS,
}
