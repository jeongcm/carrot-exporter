export interface IResource {
  resourceKey: number;
  resourceId: string;
  resourceGroupKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  resourceName: string;
  resourceDescription: string;
  resourceInstance: string;
  resourceType: string;
  resourceLevel1: string;
  resourceLevel2: string;
  resourceLevel3: string;
  resourceLevel4: string;
  resourceLevelType: string;
  resourceRbac: Boolean;
  resourceAnomalyMonitor: Boolean;
  resourceActive: Boolean;
  resourceStatus: JSON;
  resourceStatusUpdatedAt: Date;
  customerAccountKey: number;
  parentResourceId: string;
  resourceNamespace: string;
}
