import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class ExecutorDto {
    @IsString()
    @IsNotEmpty()
    public resourceGroupName: string;
  
    @IsString()
    @IsNotEmpty()
    public customerAccountId: string;
  
    @IsString()
    @IsNotEmpty()
    public resourceGroupProvider: 'AW' | 'GC' | 'DO' | 'AZ' | 'PR' | 'OR' | 'OT';
  
    @IsString()
    @IsNotEmpty()
    public resourceGroupPlatform: 'OS' | 'K8';
  }
  
  export class ExecutorKpsDto {
    @IsString()
    @IsNotEmpty()
    public clusterUuid: string;
  
    @IsString()
    @IsNotEmpty()
    public targetNamespace: string;
  }

  export class ExecutorUuidDto {
    @IsString()
    @IsNotEmpty()
    public clusterUuid: string;
  
  }


  export interface IExecutorClient {
    exectuorServerUrl: string;
    clusterUuid: string;
    token: string;
  }

  export class ExecutorResourceListDto {
    @IsString()
    @IsNotEmpty()
    public resourceType: string;

    @IsString()
    @IsNotEmpty()
    public clusterUuid: string;

    @IsString()
    public targetNamespace: string;

    @IsString()
    public name: string;

    @IsObject()
    public labels: object;
}

export class ExecutorResultDto {

    @IsString()
    public serviceUuid: string;
    
    @IsString()
    public name: string;
    
    @IsString()
    public clusterUuid: string;

    @IsObject()
    public result: object;

    @IsString()
    public status: string;

}

export class ExecutorResourceDto {
    @IsString()
    @IsNotEmpty()
    public resourceType: string;

    @IsString()
    @IsNotEmpty()
    public clusterUuid: string;

    @IsString()
    @IsNotEmpty()
    public cronTab: string;

}

export interface IExecutorClientCheck {
  resourceJobKey: object;
  clientUuid: string;
}

export class SudoryWebhookDto {

  @IsNotEmpty()
  public service_uuid: string;
  public result: string;
  public service_name: string;
  public cluster_uuid: string;
  public status: number;
  public step_count: number;
  public step_position: number;
  public template_uuid: string;
  public assgined_client_uuid: string;
  public result_type: string;
  public status_description: string;
}