export interface IChart {
  chartKey: number;
  chartId: string;
  customerAccountKey: number;
  resourceGroupKey: number;
  resourceKey: number;
  configJson: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
