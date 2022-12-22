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
  resourceGroupAlertManager: string;
  resourceGroupLoki: string;
  resourceGroupSudoryNamespace: string;
  resourceGroupKpsLokiNamespace: string;
  resourceGroupLastServerUpdatedAt: Date;
  resourceGroupSudoryRebounceRequest: string;
  resourceGroupAlertRepeatInterval: number;
  resourceGroupAlertGroupWait: number;
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
  resourceGroupAlertManager: string;
  resourceGroupLoki: string;
  resourceGroupSudoryNamespace: string;
  resourceGroupKpsLokiNamespace: string;
  resourceGroupLastServerUpdatedAt: Date;
  numberOfNode: number;
  resourceGroupServerInterfaceStatus: boolean;
}
