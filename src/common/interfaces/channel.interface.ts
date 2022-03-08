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
  pk: number;
  id: string;
  name: string;
  channelType: ChannelType;
  description: string;
  configJSON: string;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
