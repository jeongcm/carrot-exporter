export interface IExporters {
  exporterKey: number;
  exporterId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  exporterName: string;
  exporterDescription: string;
  exporterHelmChartRepoUrl: string;
  exporterHelmChartName: string;
  exporterHelmChartVersion: string;
  exporterHelmChartValues: JSON;
  grafanaDashboard: JSON;
  exporterType: string;
  exporterNamespace: string;
  exporterExporterhubUrl: string;
  defaultChartYn: Boolean;
}
