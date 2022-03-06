import { ChannelType } from '@/types';

export interface SlackMessage {
  name: string;
  webLink: string;
  description: string;
  clusterName: string;
  severity: string;
}
