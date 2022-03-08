import { LogStatus, LogType } from '@/types';

export interface Log {
  id: number;
  uuid: string;
  name: string;
  from: 'USER' | 'LARI' | 'SYSTEM';
  type: LogType;
  status: LogStatus;
  isActive: boolean;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  message: string;
  hasDescriptiveLog: boolean;
  descriptiveLog: string;
}
