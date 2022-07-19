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
  resourceGroupUuid: string;
  resourceGroupPrometheus: string;
  resourceGroupGrafana: string;
  resoruceGroupAlertManger: string;
  resourceGroupLoki: string;
}

export interface IResourceGroupUi {
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
  resourceGroupUuid: string;
  resourceGroupPrometheus: string;
  resourceGroupGrafana: string;
  resoruceGroupAlertManger: string;
  resourceGroupLoki: string;
  numberofNode: number;
}
