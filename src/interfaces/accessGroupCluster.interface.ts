export interface AccessGroupCluster {
  id: number;
  uuid: string;
  accessGroupId: number;
  clusterId: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
}
