import { ChannelType } from '@/common/types';
export interface IAlertChannel {
  channelType: 'EMAIL' | 'SLACK';
  createdAt: string;
  createdBy: number;
  description: string;
  id: number;
  name: string;
  updatedAt: string;
  updatedBy: number;
}

export interface IEmailChannel {
  channelType: 'EMAIL' | 'SLACK';
  createdAt: string;
  createdBy: number;
  description: string;
  id: number;
  name: string;
  updatedAt: string;
  updatedBy: number;
  fromEmail: string;
  host: string;
  password: string;
  port: number;
  username: string;
}

export interface ISlackChannel {
  channelType: 'EMAIL' | 'SLACK';
  createdAt: string;
  createdBy: number;
  description: string;
  id: number;
  name: string;
  updatedAt: string;
  updatedBy: number;
  apiUrl: string;
  slackChannelName: string;
}

export interface Channel {
  channelKey: number;
  customerAccountId: number;
  channelId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  channelName: string;
  channelDescription: string;
  channelType: string;
  channelAdaptor: string;
}

export interface PartyChannel {
  partyChannelKey: number;
  partyKey: number;
  channelKey: number;
  PartychannelId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  partyChannelFrom: Date;
  partyChannelTo: Date;
  partyChannelDefault: boolean;
}
