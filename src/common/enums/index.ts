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
  EMAIL = 'EMAIL',
  SLACK = 'SLACK',
  WEBHOOK = 'WEBHOOK',
}

export enum LogType {
  INDEPENDENT = 'INDEPENDENT',
  CHAINED = 'CHAINED',
}

export enum LogOrigin {
  USER = 'USER',
  LARI = 'LARI',
  SYSTEM = 'SYSTEM',
}

export enum LogStatus {
  CLOSED = 'CLOSED',
  HIDDEN = 'HIDDEN',
  OPEN = 'OPEN',
  REFERENCED = 'REFERENCED',
}

export enum EventStatus {
  CLOSED = 'CLOSED',
  HIDDEN = 'HIDDEN',
  OPEN = 'OPEN',
  REFERENCED = 'REFERENCED',
}

export enum EventFrom {
  LARI = 'LARI',
  PROMETHEUS = 'PROMETHEUS',
}

export enum UserRole {
  OWNER = 'OWNER',
  MAINTAINER = 'MAINTAINER',
  MEMBER = 'MEMBER',
}
