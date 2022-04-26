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
  partyUserKey: number;
  partyUserId: string;
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
  partyUserStatus:string;
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
  partyUserStatus:string;
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
  isEmailValidated: boolean;
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

export interface ITokenData {
  token: string;
  expiresIn: number;
}

export interface IDataStoredInToken {
  partyUserKey: number;
}

export interface IRequestWithUser extends Request {
  user: IParty;
  customerAccountKey: number;
  systemId?: string;
}

export interface IRequestWithSystem extends Request {
  systemId: string;
}
