export interface IResourceGroup {
  resourceGroupKey: number;
  resourceGroupId: string;
  customerAccountKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  resourceGroupName: string;
  resourceGroupDescription: string;
  resourceGroupProvider: string;
  resourceGroupPlatform: string;
  resourceGroupUUID: string;
  resourceGroupPrometheus: string;
}
