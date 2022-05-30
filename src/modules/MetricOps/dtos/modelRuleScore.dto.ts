import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AttachRuleGroupDto {
    @IsString()
    @IsOptional()
    public ruleGroupId: string;
  
    @IsString()
    @IsOptional()
    public bayesianModelId: string;
  
    @IsString()
    @IsOptional()
    public scoreCard: JSON;
  
  }

export class DetachRuleGroupDto {
    @IsString()
    @IsOptional()
    public ruleGroupId: string;
  
    @IsString()
    @IsOptional()
    public bayesianModelId: string;

    
    @IsString()
    @IsOptional()
    public modelRuleScoreId: string;
  
  
  }