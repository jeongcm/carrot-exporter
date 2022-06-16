import {
  Allow,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsDate,
  IsObject,
  IsNumber,
  IsByteLength,
  IsDateString,
  isBooleanString,
} from 'class-validator';
import { ResourceType, ResourceTypeLevel1, ResourceTypeLevel2, ResourceTypeLevel3, ResourceTypeLevel4 } from 'common/types';

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
  @IsOptional()
  public resourceInstance: string;

  @IsString()
  @IsNotEmpty()
  public resourceType: string;

  @IsString()
  @IsOptional()
  public resourceLevel1: string;

  @IsString()
  @IsOptional()
  public resourceLevel2: string;

  @IsString()
  @IsOptional()
  public resourceLevel3: string;

  @IsString()
  @IsOptional()
  public resourceLevel4: string;

  @IsString()
  @IsOptional()
  public resourceLevelType: string;

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
  @IsOptional()
  public resourceNamespace: string;

  @IsDateString()
  @IsOptional()
  public resourceTargetCreatedAt: Date;

  @IsObject()
  @IsOptional()
  public resourceOwnerReferences: JSON;
}
export class ResourceQueryDTO {
  @Allow()
  @IsOptional()
  public resourceType: ResourceType[];

  //@isBooleanString()
  @IsOptional()
  public excludeFailed: Boolean;

  @IsOptional()
  public searchResourceName: string;

  @IsOptional()
  public searchResourceValue: string;
}
