import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDate, IsJSON, IsNumber } from 'class-validator';

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
  public resourceType: string;

  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  public resourceLevelType: string;

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

  @IsJSON()
  @IsOptional()
  public resourceStatus: JSON;

  @IsNumber()
  @IsNotEmpty()
  public customerAccountKey: number;

  @IsString()
  @IsNotEmpty()
  public parentResourceId: string;

  @IsString()
  @IsNotEmpty()
  public resourceNamespace: string;
}
