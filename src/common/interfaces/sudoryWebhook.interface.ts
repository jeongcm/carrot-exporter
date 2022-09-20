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
  serviceName: string;
  status: number;
  clusterUuid: string;
  serviceResultType: string;
  statusDescription: string;
  stepCount: number;
  stepPosition: number;
  assignedClientUuid: string;
  templateUuid: string;
}
