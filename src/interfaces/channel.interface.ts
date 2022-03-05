import { ChannelType } from '@/types';
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
  createdBy: string;
  description: string;
  id: number;
  name: string;
  updatedAt: string;
  updatedBy: string;
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
  updatedBy: string;
  apiUrl: string;
  slackChannelName: string;
}

export interface Channel {
  id: number;
  uuid: string;
  name: string;
  channelType: ChannelType;
  description: string;
  configJSON: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
}
