export interface PartyChannel {
  partyChannelKey: number;
  partyKey: number;
  channelKey: number;
  PartychannelId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  partyChannelFrom: Date;
  partyChannelTo: Date;
  partyChannelDefault: boolean;
}

import { Request } from 'express';

export interface IParty {
  partyKey: number;
  partyId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  partyName: string;
  partyDescription: string;
  parentPartyId: string;
  partyType: 'US' | 'AG'; // "US":User, "AG":Access Group
  customerAccountKey: number;
  PartyUser?: IPartyUser;
}

export interface IPartyRelation {
  partyRelationKey: number;
  partyRelationId: string;
  partyParentKey: number;
  partyChildKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  partyRelationType: 'AU' | 'AA'; // "AU": AccessGroup-User,  "AA": AccessGroup-AccessGroup
  partyRelationFrom: Date;
  partyRelationTo: Date;
}

export interface IPartyUser {
  partyUserId: string;
  partyUserKey: number;
  partyKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  firstName: string;
  lastName: string;
  userId: string;
  mobile: string;
  password: string;
  email: string;
  isEmailValidated: boolean;
  emailValidatedAt: Date;
  token: string;
  lastAccessAt: Date;
  partyUserStatus: string;
  socialProviderId: string;
  timezone: string;
  adminYn: boolean;
  systemYn: boolean;
  language: string;
  oldPassword: any;
}

export interface IPartyResource {
  partyResourceKey: number;
  partyResourceId: string;
  partyKey: number;
  resourceKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface IPartyUserLogs {
  partyUserLogsKey: number;
  partyUserLogsId: string;
  partyUserKey: number;
  apiKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface IPartyUserResponse {
  partyId: string;
  partyName: string;
  partyDescription: string;
  parentPartyId: string;
  partyType: 'US';
  createdBy: string;
  partyUserId: string;
  firstName: string;
  lastName: string;
  userId: string;
  mobile: string;
  email: string;
  timezone: string;
  isEmailValidated: boolean;
  language: string;
  errors: any;
}

export interface IPartyResponse {
  partyId: string;
  partyName: string;
  partyDescription: string;
  partyType: 'AG' | 'US';
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  parentPartyId: string;
}

export interface IPartyUserAPILog {
  partyUserLogsId: string;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Api: {
    apiId: string;
    createdBy: string;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    apiName: string;
    apiDescription: string;
    apiEndPoint1: string;
    apiEndPoint2: string;
    apiVisibleTF: boolean;
  };
}

export interface ITokenData {
  token: string;
  expiresIn: number;
}

export interface IDataStoredInToken {
  partyUserKey: number;
  customerAccountKey: number;
}

export interface IRequestWithUser extends Request {
  user: IParty;
  customerAccountKey: number;
  systemId?: string;
  file?: any;
}

export interface IRequestWithSystem extends Request {
  systemId: string;
}

export interface IPartyUserPassword {
  partyUserPasswordKey: number;
  partyUserPasswordId: string;
  partyUserKey: number;
  createdBy: string;
  updatedBy: string;
  updatedAt: Date;
  deletedAt: Date;
  password: string;
  partyUserPasswordStatus: string;
  createdAt: Date;
}
