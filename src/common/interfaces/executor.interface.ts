export interface IExecutorService {
    executorServiceKey: number;
    executorServiceId: string;
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
    templateUuid: string;
}