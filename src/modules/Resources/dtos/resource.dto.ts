import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDate, IsObject, IsNumber, IsByteLength } from 'class-validator';

export class ResourceDto {
  @IsNumber()
  @IsNotEmpty()
  public resourceGroupKey: number;

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
  public resourceType: 'KN' |'KS' | 'OP';

  @IsString()
  @IsNotEmpty()
  public resourceLevel1: 'KN' |'KS' | 'OP';

  @IsString()
  @IsOptional()
  public resourceLevel2: 'KN' |'KS' | 'OP';

  @IsString()
  @IsOptional()
  public resourceLevel3: 'KN' |'KS' | 'OP';

  @IsString()
  @IsOptional()
  public resourceLevel4: 'KN' |'KS' | 'OP';

  @IsString()
  @IsNotEmpty()
  public resourceLevelType: 'KN' |'KS' | 'OP';;

  @IsBoolean()
  @IsNotEmpty()
  public resourceRBAC: Boolean;

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
  @IsNotEmpty()
  public parentResourceId: string;

  @IsString()
  @IsNotEmpty()
  public resourceNamespace: string;
}
