import { IsString, IsNotEmpty } from 'class-validator';

export class ResourceGroupDto {
  @IsString()
  @IsNotEmpty()
  public resourceGroupName: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupDescription: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupProvider: 'AW' | 'GC' | 'DO' | 'AZ' | 'PR' | 'OR' | 'OT';

  @IsString()
  @IsNotEmpty()
  public resourceGroupPlatform: 'OS' | 'K8';

  @IsString()
  @IsNotEmpty()
  public resourceGroupUuid: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupPrometheus: string;
}
