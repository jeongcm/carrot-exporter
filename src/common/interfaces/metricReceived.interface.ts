export interface IMetricReceived{
    metricReceivedKey: number;
    metricReceivedId: string;
    metricReceivedHash: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    metricReceivedName: string;
    metricReceivedMetricInstance: string;
    metricReceivedMetricJob: string;
    metricReceivedMetricService: string;
    metricReceivedMetricPod: string;
    metricReceivedMetric: JSON;
    metricReceivedMetricValue: string;
    metricReceivedMetricDatetime: Date;
    customerAccountKey: number;
    metricMetaKey: number;
}