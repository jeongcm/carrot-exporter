import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDate, IsObject, IsNumber, IsByteLength, IsDateString } from 'class-validator';
import { ResourceType, ResourceTypeLevel1, ResourceTypeLevel2, ResourceTypeLevel3, ResourceTypeLevel4 } from 'common/types'

export class ResourceDto {
  @IsString()
  @IsNotEmpty()
  public resourceGroupId: string;

  @IsString()
  @IsNotEmpty()
  public resourceTargetUuid: string;

  @IsString()
  @IsNotEmpty()
  public resourceName: string;

  @IsString()
  @IsNotEmpty()
  public resourceDescription: string;

  @IsString()
  @IsNotEmpty()
  public resourceInstance: string;

  @IsString()
  @IsNotEmpty()
  public resourceType: ResourceType;

  @IsString()
  @IsNotEmpty()
  public resourceLevel1: ResourceTypeLevel1;

  @IsString()
  @IsOptional()
  public resourceLevel2: ResourceTypeLevel2;

  @IsString()
  @IsOptional()
  public resourceLevel3: ResourceTypeLevel3;

  @IsString()
  @IsOptional()

  public resourceLevel4: ResourceTypeLevel4;

  @IsString()
  @IsNotEmpty()
  public resourceLevelType: 'KN' | 'KS' | 'OP';

  @IsBoolean()
  @IsNotEmpty()
  public resourceRbac: Boolean;

  @IsBoolean()
  @IsNotEmpty()
  public resourceAnomalyMonitor: Boolean;

  @IsBoolean()
  @IsNotEmpty()
  public resourceActive: Boolean;

  @IsDate()
  @IsOptional()
  public resourceStatusUpdatedAt: Date;

  @IsObject()
  @IsOptional()
  public resourceStatus: JSON;

  @IsString()
  @IsOptional()
  public parentResourceId: string;

  @IsString()
  @IsNotEmpty()
  public resourceNamespace: string;

  @IsDateString()
  @IsNotEmpty()
  public resourceTargetCreatedAt: Date;

  @IsObject()
  @IsOptional()
  public resourceOwnerReferences: JSON;
}
export class resourceTypeCustomerAccountIdDto {
  @IsString()
  public resourceType: ResourceType[];
}

export class resourceTypeResourceGroupIdDto {
  @IsString()
  public resourceType: ResourceType[];
}
