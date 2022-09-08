export interface IExecutorService {
  executorServiceKey: number;
  executorServiceId: string;
  customerAccountKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  serviceUuid: string;
  clusterUuid: string;
  name: string;
  summary: string;
  onCompletion: number;
  subscribedChannel: string;
  steps: JSON;
  templateUuid: string;
  status: number;
  statusDescription: string;
}
