export interface AccessGroupCluster {
  pk: number;
  id: string;
  accessGroupPk: string;
  clusterPk: string;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
