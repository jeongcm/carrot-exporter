import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ITableId } from '@/common/interfaces/tableId.interface';

export type TableIdUpdateAttributes = Optional<
  ITableId,
  | 'tableIdKey'
  | 'tableIdTableName'
  | 'tableIdHeader'
  | 'tableMonth'
  | 'tableYear'
  | 'tableDay'
  | 'tableIdSequenceDigit'
  | 'tableIdFinalIssued'
  | 'isDeleted'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
>;

export class TableIdModel extends Model<ITableId, TableIdUpdateAttributes> implements ITableId {
  public tableIdKey: number;
  public tableIdTableName: string;
  public tableIdHeader: string;
  public tableMonth: number;
  public tableYear: number;
  public tableDay: number;
  public tableIdSequenceDigit: number;
  public tableIdIssuedSequence: number;
  public tableIdFinalIssued: string;

  public isDeleted: Date;
  public createdBy: string;
  public updatedBy: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof TableIdModel {
  TableIdModel.init(
    {
      tableIdKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      tableIdTableName: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
      },
      tableIdHeader: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(2),
      },
      tableMonth: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      tableYear: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      tableDay: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      tableIdSequenceDigit: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      tableIdIssuedSequence: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      tableIdFinalIssued: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      isDeleted: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
    },
    {
      tableName: 'TableId',
      modelName: 'TableId',
      sequelize,
    },
  );

  return TableIdModel;
}
