import { EventFrom, EventStatus } from '@/common/types';

export interface Event {
  pk: number;
  id: string;
  name: string;
  from: EventFrom;
  type: string;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  source: string;
  startAt: Date;
  status: EventStatus;
  message: string;
  cancelable: boolean;
  shownToUser: boolean;
}
