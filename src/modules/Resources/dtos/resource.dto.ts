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

export class ResourceDetailQueryDTO {
  @IsOptional()
  public resourceNamespace: string;

  @IsNotEmpty()
  public resourceName: string;

  @IsNotEmpty()
  public resourceType: string;

  @IsNotEmpty()
  public resourceGroupUuid: string;

  @IsOptional()
  public nodeName: string;
}

export class ResourceRawDto {
  @IsNumber()
  @IsNotEmpty()
  public resource_key: number;

  @IsString()
  @IsNotEmpty()
  public resource_id: string;

  public resource_group_key: number;
  public created_by: string;
  public updated_by: string;
  public created_at: Date;
  public updated_at: Date;
  public deleted_at: Date;
  public resource_target_uuid: string;
  public resource_target_createdAt: Date;
  public resource_name: string;
  public resource_description: string;
  public resource_labels: any;
  public resource_annotations: any;
  public resource_instance: string;
  public resource_spec: any;
  public resource_type: string;
  public resource_level1: string;
  public resource_level2: string;
  public resource_level3: string;
  public resource_level4: string;
  public resource_level_type: string;
  public resource_pod_phase: string;
  public resource_pod_container: any;
  public resource_pod_volume: any;
  public resource_replicas: number;
  public resource_sts_volume_claim_templates: any;
  public resource_pvc_storage: any;
  public resource_pvc_volume_name: string;
  public resource_pvc_storage_class_name: string;
  public resource_pvc_volume_mode: string;
  public resource_endpoint: any;
  public resource_configmap_data: any;
  public resource_ingress_class: string;
  public resource_ingress_rules: any;
  public resource_pv_storage: string;
  public resource_pv_claim_ref: any;
  public resource_pv_storage_class_name: string;
  public resource_pv_volume_mode: string;
  public resource_sc_provisioner: string;
  public resource_sc_reclaim_policy: string;
  public resource_sc_allow_volume_expansion: Boolean;
  public resource_sc_volume_binding_mode: string;
  public resource_match_labels: any;
  public resource_rbac: Boolean;
  public resource_anomaly_monitor: Boolean;
  public resource_active: Boolean;
  public resource_status: any;
  public resource_status_updated_at: Date;
  public customer_account_key: number;
  public parent_resource_id: string;
  public resource_namespace: string;
  public resource_owner_references: any;
  public resource_app: string;
}
