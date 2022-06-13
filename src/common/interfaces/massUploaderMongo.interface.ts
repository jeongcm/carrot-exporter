export interface IMetricReceivedMassFeed {
    assigned_client_uuid: string,
    cluster_uuid: string,
    event_name: string,
    result: string,
    service_name: string,
    service_uuid: string,
    status: number,
    step_count: number,
    step_position: number,
    template_uuid: string
}