import { EventFrom, EventStatus } from '@/types';

export interface Event {
  name: string;
  from: EventFrom;
  type: string;
  id: string;
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
