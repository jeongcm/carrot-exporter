import { IsString, IsBoolean, IsNotEmpty, IsNumber, IsDate, IsOptional } from 'class-validator';

export class IssueTableIdDto {
  @IsString()
  @IsNotEmpty()
  public tableIdTableName: string;
}

export interface IResponseIssueTableIdDto {
  tableIdTableName: string;
  tableIdFinalIssued: string;
}

export interface IResponseIssueTableIdBulkDto {
  tableIdTableName: string;
  tableIdFinalIssued: string;
  tableIdRange: number;
}