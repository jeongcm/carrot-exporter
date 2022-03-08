import { LogStatus, LogType } from '@/common/types';

export interface Log {
  pk: number;
  id: string;
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
