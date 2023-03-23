import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ResourceGroupDto {
  @IsString()
  @IsNotEmpty()
  public resourceGroupName: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupDescription: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupProvider: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupPlatform: 'OS' | 'K8';

  @IsString()
  public resourceGroupUuid: string;

  @IsString()
  public resourceGroupPrometheus: string;

  @IsString()
  public resourceGroupSudoryNamespace: string;

  @IsString()
  public resourceGroupKpsLokiNamespace: string;

  @IsString()
  @IsOptional()
  public resourceGroupLastServerUpdatedAt: Date;

  @IsString()
  @IsOptional()
  public resourceGroupSudoryRebounceRequest: string;

  @IsString()
  @IsOptional()
  public resourceGroupHelmInstallInfo: any;
}
export class UpdateResourceGroupDto {
  @IsString()
  @IsOptional()
  public resourceGroupName: string;

  @IsString()
  @IsOptional()
  public resourceGroupDescription: string;

  @IsString()
  @IsOptional()
  public resourceGroupProvider: string;

  @IsString()
  @IsOptional()
  public resourceGroupPlatform: 'OS' | 'K8';

  @IsString()
  @IsOptional()
  public resourceGroupUuid: string;

  @IsString()
  @IsOptional()
  public resourceGroupPrometheus: string;

  @IsString()
  @IsOptional()
  public resourceGroupSudoryNamespace: string;

  @IsString()
  @IsOptional()
  public resourceGroupKpsLokiNamespace: string;

  @IsString()
  @IsOptional()
  public resourceGroupLastServerUpdatedAt: Date;

  @IsString()
  @IsOptional()
  public resourceGroupSudoryRebounceRequest: string;
  @IsNumber()
  @IsOptional()
  public resourceGroupAlertRepeatInterval: number;

  @IsNumber()
  @IsOptional()
  public resourceGroupAlertGroupWait: number;

  @IsString()
  @IsOptional()
  public resourceGroupHelmInstallInfo: any;
}

export class ResourceGroupExecutorDto {
  @IsString()
  @IsNotEmpty()
  public resourceGroupName: string;

  @IsString()
  @IsNotEmpty()
  public customerAccountId: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupProvider: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupPlatform: 'OS' | 'K8';

  @IsString()
  @IsOptional()
  public resourceGroupSudoryNamespace: string;

  @IsString()
  @IsOptional()
  public resourceGroupKpsLokiNamespace: string;

  @IsString()
  @IsOptional()
  public resourceGroupHelmInstallInfo: any;
}

export class ResourceGroupKpsDto {
  @IsString()
  @IsNotEmpty()
  public clusterUuid: string;

  @IsString()
  @IsNotEmpty()
  public targetNamespace: string;
}
