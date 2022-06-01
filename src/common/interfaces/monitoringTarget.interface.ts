export interface IAnomalyMonitoringTarget {
    anomalyMonitoringTargetKey : number;
    subscribedProductKey : number;
    bayesianModelKey : number;
    anomalyMonitoringTargetId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    anomalyMonitoringTargetName : string;
    anomalyMonitoringTargetDescription  : string;
    anomalyMonitoringTargetStatus  : string;

}