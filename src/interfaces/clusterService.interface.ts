export interface IClusterServiceLabel {
  enable: boolean;
  id: number;
  label: string;
  name: string;
  serviceId: number;
}

export interface IClusterServciePort {
  enable: boolean;
  id: number;
  name: string;
  nodePort: string;
  port: string;
  protocol: string;
  serviceId: number;
  targetPort: string;
}

export interface IClusterService {
  clusterId: number;
  exporterKey: string;
  exporterStatus:
    | 'ACTIVE'
    | 'BEING_INSTALLED'
    | 'EXPOSE_CHANGING'
    | 'EXPOSE_FAILED'
    | 'GLOBALVIEW_CHANGING'
    | 'GLOBALVIEW_REMOVING'
    | 'INACTIVE'
    | 'INSTALL_FAILED'
    | 'NOT_INSTALLED';
  groupId: number;
  id: number;
  labels: IClusterServiceLabel[];
  name: string;
  namespace: string;
  ports: IClusterServciePort[];
  serviceType: string;
  tenancyId: number;
  type: 'ClusterIP' | 'LoadBalancer' | 'NodePort';
}

export interface ClusterP8sService {
  createdAt: string;
  createdBy: number;
  deleted: boolean;
  etcParam: string;
  exposeType: string;
  exposed: boolean;
  id: number;
  linkUrl: string;
  name: string;
  new: boolean;
  p8sId: number;
  status: string;
  updatedAt: string;
  updatedBy: number;
}
