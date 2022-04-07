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
  public resourceGroupProvider: 'AW' | 'GC' | 'DO' | 'AZ' | 'PR';

  @IsString()
  @IsNotEmpty()
  public resourceGroupPlatform: 'OS' | 'K8';

  @IsString()
  @IsNotEmpty()
  public resourceGroupUUID: string;

  @IsString()
  @IsNotEmpty()
  public resourceGroupPrometheus: string;
}
