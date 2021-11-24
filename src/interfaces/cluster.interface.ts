import { ClusterP8sService, IClusterService } from './clusterService.interface';

import { Platform } from '@/enums';

export interface ICluster {
  agentStatus: string;
  clusterType: 'DEFAULT_INSTALL' | 'GLOBAL_CHILD' | 'GLOBAL_PRIMARY' | 'GLOBAL_SECONDARY' | 'NONE';
  createdAt: string;
  createdBy: number;
  dashboardUrl: string;
  deleted: true;
  description: string;
  icon: string;
  id: number;
  initStatus:
    | 'ACTIVE'
    | 'BEING_INSTALLED'
    | 'EXPOSE_CHANGING'
    | 'EXPOSE_FAILED'
    | 'GLOBALVIEW_CHANGING'
    | 'GLOBALVIEW_REMOVING'
    | 'INACTIVE'
    | 'INSTALL_FAILED'
    | 'NOT_INSTALLED';
  installCommand: string;
  name: string;
  objectId: number;
  platform: Platform;
  primaryAgentKey: string;
  provider: string;
  tags: string;
  tenancyId: number;
  updatedAt: string;
  updatedBy: number;
}

export interface IClusterAdd {
  id: string;
  description: string;
  global: boolean;
  icon: string;
  installParams: string;
  name: string;
  // objectId: number;
  platform: Platform;
  tags: string;
  tenancyId: string;
  isDeleted: boolean;
}

export interface IClusterDetail {
  account: string;
  agentStatus: string;
  clusterServices: {
    additionalProp1: IClusterService[];
    additionalProp2: IClusterService[];
    additionalProp3: IClusterService[];
  };
  clusterType: 'DEFAULT_INSTALL' | 'GLOBAL_CHILD' | 'GLOBAL_PRIMARY' | 'GLOBAL_SECONDARY' | 'NONE';
  dashboardUrl: string;
  description: string;
  exposedServices: ClusterP8sService[];
  icon: string;
  id: number;
  initStatus:
    | 'ACTIVE'
    | 'BEING_INSTALLED'
    | 'EXPOSE_CHANGING'
    | 'EXPOSE_FAILED'
    | 'GLOBALVIEW_CHANGING'
    | 'GLOBALVIEW_REMOVING'
    | 'INACTIVE'
    | 'INSTALL_FAILED'
    | 'NOT_INSTALLED';
  installCommand: string;
  license: string;
  name: string;
  nodeCount: number;
  objectId: number;
  p8sStatus: string;
  platform: Platform;
  primaryAgentKey: string;
  provider: string;
  size: number;
  tags: string;
  tenancyId: number;
  version: string;
}

export interface IClusterUpdate {
  description: string;
  icon: string;
  name: string;
  tags: string;
}

export interface IKlevrAgent {
  active: boolean;
  agentKey: string;
  core: number;
  disk: number;
  ip: string;
  lastAccessTime: string;
  lastAliveCheckTime: string;
  memory: number;
  port: number;
  version: string;
}

export interface IConfigPayload {
  configurationStatus:
    | 'APPLY_ERROR'
    | 'APPLY_FAILED'
    | 'LOADING_ERROR'
    | 'NOT_INITIALIZED'
    | 'OK'
    | 'TESTING'
    | 'TEST_ERROR'
    | 'TEST_FAILED'
    | 'TEST_OK'
    | 'UPDATING';
  contents: string;
  notAppliedContents: string;
  testLog: string;
}

export interface IClusterDashboardMonitoring {
  alertManagerStatus: string;
  apiServerResponseStatus: string;
  apiServerStatus: string;
  clusterAge: string;
  clusterCpuUsage: string;
  clusterDiskUsage: string;
  clusterMemoryUsage: string;
  clusterNaNodes: number;
  clusterNamespaces: number;
  clusterNodes: number;
  clusterPodUsage: string;
  clusterPods: number;
  clusterStatus: string;
  failedPods: number;
  p8sStatus: string;
  pendingPods: number;
  pvcs: number;
  restartedPods: number;
}

export interface IP8sExpose {
  serviceName: 'ALERTMANAGER' | 'GRAFANA' | 'METRICARK' | 'METRICARK_API' | 'PROMETHEUS' | 'PROMLENS' | 'PUSHGATEWAY';
  serviceType: 'ClusterIP' | 'LoadBalancer' | 'NodePort';
}

export interface IP8sInstallParams {
  installParams: string;
}

export interface IGlobalViewCluster {
  agentScript: string;
  agentStatus: string;
  clusterType: 'DEFAULT_INSTALL' | 'GLOBAL_CHILD' | 'GLOBAL_PRIMARY' | 'GLOBAL_SECONDARY' | 'NONE';
  dashboardUrl: string;
  grafanaUrl: string;
  id: number;
  initStatus:
    | 'ACTIVE'
    | 'BEING_INSTALLED'
    | 'EXPOSE_CHANGING'
    | 'EXPOSE_FAILED'
    | 'GLOBALVIEW_CHANGING'
    | 'GLOBALVIEW_REMOVING'
    | 'INACTIVE'
    | 'INSTALL_FAILED'
    | 'NOT_INSTALLED';
  name: string;
  platform: 'AWS' | 'baremetal' | 'kubernetes';
  primaryAgentKey: string;
  tenancyId: number;
}

export interface IP8sService {
  etcParam: 'string';
  linkUrl: 'string';
  serviceName: 'ALERTMANAGER' | 'GRAFANA' | 'METRICARK' | 'METRICARK_API' | 'PROMETHEUS' | 'PROMLENS' | 'PUSHGATEWAY';
  serviceType: 'ClusterIP' | 'LoadBalancer' | 'NodePort';
  status:
    | 'ACTIVE'
    | 'BEING_INSTALLED'
    | 'EXPOSE_CHANGING'
    | 'EXPOSE_FAILED'
    | 'GLOBALVIEW_CHANGING'
    | 'GLOBALVIEW_REMOVING'
    | 'INACTIVE'
    | 'INSTALL_FAILED'
    | 'NOT_INSTALLED';
}

export interface IP8sServices {
  p8sServices: IP8sService[];
}

export interface IP8sVolumn {
  timescaleTotalSize: string; // '10Gi'
  timescaleUsedPercent: string; //'10%'
  timescaleUsedSize: string; //'1Gi'
  walTotalSize: string; //'10Gi'
  walUsedPercent: string; //'10%'
  walUsedSize: string; //'1Gi'
}

export interface IAllClusterAlert {
  firingAlerts: number;
  inactiveAlerts: number;
  pendingAlerts: number;
}

export interface IGlobalViewDashboardMonitoring {
  clusterCount: number;
  status: {};
}

export interface IClusterOverall {
  clusterGroups: number;
  clusters: number;
  firingAlerts: number;
  nodes: number;
  zones: number;
}

export type IVerification = 'ALREADY_EXISTS' | 'OK';
