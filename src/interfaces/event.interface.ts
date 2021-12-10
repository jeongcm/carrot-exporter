import { EventFrom, EventStatus } from '@/enums';

export interface Event {
  name: string;
  from: EventFrom;
  type: string;
  id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  source: string;
  startAt: Date;
  status: EventStatus;
  message: string;
  cancelable: boolean;
  shownToUser: boolean;
}
