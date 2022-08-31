import { IsString, IsNotEmpty } from 'class-validator';
import { isString } from 'lodash';

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
  public resourceGroupSudoryNamespace: string;

  @IsString()
  public resourceGroupKpsLokiNamespace: string;
}

export class ResourceGroupKpsDto {
  @IsString()
  @IsNotEmpty()
  public clusterUuid: string;

  @IsString()
  @IsNotEmpty()
  public targetNamespace: string;
}