import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDate, IsObject, IsNumber, IsByteLength, IsDateString } from 'class-validator';

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
  public resourceType: 'K8' | 'ND' | 'PD' | 'NS' | 'SV' | 'OP' | 'PD' | 'PM' | 'PJ' | 'VM' | 'CT';

  @IsString()
  @IsNotEmpty()
  public resourceLevel1: 'K8' | 'OP';

  @IsString()
  @IsOptional()
  public resourceLevel2: 'ND' | 'NS' | 'PJ';

  @IsString()
  @IsOptional()
  public resourceLevel3: 'PD' | 'SV' | 'PM';

  @IsString()
  @IsOptional()
  public resourceLevel4: 'CT' | 'VM';

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
  //@IsNotEmpty()
  public resourceType: string;

  @IsString()
  @IsNotEmpty()
  public customerAccountId: string;
}

export class resourceTypeResourceGroupIdDto {
  @IsString()
  //@IsNotEmpty()
  public resourceType: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupId: string;
}