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
  resourceLabels: JSON;
  resourceAnnotations: JSON;
  resourceInstance: string;
  resourceSpec: JSON;
  resourceType: string;
  resourceLevel1: string;
  resourceLevel2: string;
  resourceLevel3: string;
  resourceLevel4: string;
  resourceLevelType: string;
  resourcePodPhase: string;
  resourcePodContainer: JSON;
  resourcePodVolume: JSON;
  resourceReplicas: number;
  resourceStsVolumeClaimTemplates: JSON;
  resourcePvcStorage: JSON;
  resourcePvcVolumeName: string;
  resourcePvcStorageClassName: string;
  resourcePvcVolumeMode: string;
  resourceEndpoint: JSON;
  resourceConfigmapData: JSON;
  resourceIngressClass: string;
  resourceIngressRules: string;
  resourcePvStorage: string;
  resourcePvClaimRef: string;
  resourcePvStorageClassName: string;
  resourcePvVolumeMode: string;
  resourceScProvisioner: string;
  resourceScReclaimPolicy: string;
  resourceScAllowVolumeExpansion: Boolean;
  resourceScVolumeBindingMode: string;
  resourceMatchLabels: JSON;  
  resourceRbac: Boolean;
  resourceAnomalyMonitor: Boolean;
  resourceActive: Boolean;
  resourceStatus: JSON;
  resourceStatusUpdatedAt: Date;
  customerAccountKey: number;
  parentResourceId: string;
  resourceNamespace: string;
  resourceOwnerReferences: JSON;
}


export interface IResourceTargetUuid {
  resourceTargetUuid: string;

}