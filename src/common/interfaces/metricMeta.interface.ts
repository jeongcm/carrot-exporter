export interface IMetricMeta{
    metricMetaKey: number;
    metricMetaId: string;
    metricMetaHash: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    metricMetaName: string;
    metricMetaDescription: string;
    metricMetaType: string;
    metricMetaUnit: string;
    metricMetaTargetInstance: string;
    metricMetaTargetJob: string;
    metricMetaTargetService: string;
    metricMetaTargetPod: string;
    metricMetaTarget: JSON;
    customerAccountKey: number;
    resourceKey: number;
    resourceGroupUuid: string;
    metricMetaTargetMetricsPath: string;

}