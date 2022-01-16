import { ChannelType } from '@/enums';

export interface SlackMessage {
  name: string;
  webLink: string;
  description: string;
  clusterName: string;
  severity: string;
}
