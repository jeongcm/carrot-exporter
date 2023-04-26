export interface IResource {
  resourceKey: number;
  resourceId: string;
  resourceGroupKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  resourceTargetUuid: string;
  resourceTargetCreatedAt: Date;
  resourceName: string;
  resourceDescription: string;
  resourceLabels: any;
  resourceAnnotations: any;
  resourceInstance: string;
  resourceSpec: any;
  resourceType: string;
  resourceLevel1: string;
  resourceLevel2: string;
  resourceLevel3: string;
  resourceLevel4: string;
  resourceLevel5: string;
  resourceLevelType: string;
  resourcePodPhase: string;
  resourcePodContainer: any;
  resourcePodVolume: any;
  resourceReplicas: number;
  resourceStsVolumeClaimTemplates: any;
  resourcePvcStorage: any;
  resourcePvcVolumeName: string;
  resourcePvcStorageClassName: string;
  resourcePvcVolumeMode: string;
  resourceEndpoint: any;
  resourceConfigmapData: any;
  resourceIngressClass: string;
  resourceIngressRules: any;
  resourcePvStorage: string;
  resourcePvClaimRef: any;
  resourcePvStorageClassName: string;
  resourcePvVolumeMode: string;
  resourceScProvisioner: string;
  resourceScReclaimPolicy: string;
  resourceScAllowVolumeExpansion: Boolean;
  resourceScVolumeBindingMode: string;
  resourceMatchLabels: any;
  resourceRbac: Boolean;
  resourceAnomalyMonitor: Boolean;
  resourceActive: Boolean;
  resourceStatus: any;
  resourceStatusUpdatedAt: Date;
  customerAccountKey: number;
  parentResourceId: string;
  resourceNamespace: string;
  resourceOwnerReferences: any;
  resourceApp: string;
}

export interface IResourceTargetUuid {
  resourceTargetUuid: string;
}

export interface IK8sResourceRelationNode {
  resource: IResource;
  rel: IK8sResourceRelationNode[];
}
