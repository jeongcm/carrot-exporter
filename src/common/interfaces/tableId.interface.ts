export interface ITableId {
  tableIdKey: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  tableIdTableName: string;
  tableIdHeader: string;
  tableYear: number;
  tableMonth: number;
  tableDay: number;
  tableIdSequenceDigit: number;
  tableIdIssuedSequence: number;
  tableIdFinalIssued: string;
}
