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
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  message: string;
  hasDescriptiveLog: boolean;
  descriptiveLog: string;
}
