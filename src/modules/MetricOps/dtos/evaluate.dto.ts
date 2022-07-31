import { IsString, IsNotEmpty, IsOptional, isNotEmpty } from 'class-validator';

export class EvaluateDto {
    public bayesianModelKey: number;
    public bayesianModelId: string;
    public scoreCard: JSON;
  
  }