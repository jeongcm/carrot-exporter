import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AttachRuleGroupDto {
    @IsString()
    @IsOptional()
    public ruleGroupId: string;
  
    @IsString()
    @IsOptional()
    public bayesianModelId: string;
  

    @IsOptional()
    public scoreCard: JSON;
  
  }
export class UpdateAttachRuleGroupDto {
    @IsString()
    @IsOptional()
    public ruleGroupId: string;
  
    @IsString()
    @IsOptional()
    public bayesianModelId: string;
  

    @IsNotEmpty()
    public scoreCard: JSON;
  
  }

export class DetachRuleGroupDto {
    @IsString()
    @IsNotEmpty()
    public ruleGroupId: string;
  
    @IsString()
    @IsNotEmpty()
    public bayesianModelId: string;

  
  
  }