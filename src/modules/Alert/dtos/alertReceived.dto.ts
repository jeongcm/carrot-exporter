import { IsString, IsNotEmpty, IsNumber, IsDate, isNotEmpty, IsObject } from 'class-validator';

export class AlertReceivedDto {
    @IsString()
    @IsNotEmpty()
    public alertReceivedName: string;
  
    @IsString()
    @IsNotEmpty()
    public alertReceivedSeverity: string;
  
    @IsString()
    @IsNotEmpty()
    public alertReceivedState: string;
  
    @IsString()
    @IsNotEmpty()
    public alertReceivedDescription: string;
    
    @IsString()
    @IsNotEmpty()
    public alertReceivedSummary: string;
  
    @IsString()
    public alertReceivedValue: string;
  
    @IsString()
    public alertReceivedNamespace: string;
  
    @IsString()
    public alertReceivedNode: string;
  
    @IsNotEmpty()
    public alertReceivedPinned: boolean;
  
    @IsString()
    public alertReceivedInstance: string;
  
    @IsObject()
    public alertReceivedLabels: JSON;

    @IsString()
    public alertReceivedService: string;

    @IsString()
    public alertReceivedPod: string;
  }
  