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
  customerAccountId: string;
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
