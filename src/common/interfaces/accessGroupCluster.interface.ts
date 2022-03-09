export interface AccessGroupCluster {
  pk: number;
  id: string;
  accessGroupPk: number;
  clusterPk: number;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
