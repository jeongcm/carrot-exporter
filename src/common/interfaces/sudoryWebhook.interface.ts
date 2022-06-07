export interface ISudoryWebhook {
    sudoryWebhookKey: number;
    sudoryWebhookId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    serviceUuid: string;
    serviceResult: JSON;
}