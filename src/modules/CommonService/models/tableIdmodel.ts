import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ITableId } from '@/common/interfaces/tableId.interface';

export type tableIdUpdateAttributes = Optional<
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



export class tableIdModel extends Model<ITableId, tableIdUpdateAttributes> implements ITableId {
  public tableIdKey: number;
  public tableIdTableName: string;
  public tableIdHeader: string;
  public tableMonth: number;
  public tableYear: number;
  public tableDay: number;
  public tableIdSequenceDigit: number;
  public tableIdIssuedSequence: number;
  public tableIdFinalIssued: string;

  public isDeleted: boolean;
  public createdBy: string;
  public updatedBy: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;


}

export default function (sequelize: Sequelize): typeof tableIdModel {
  tableIdModel.init(
    {
      tableIdKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      tableIdTableName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      tableIdHeader: {
        allowNull: false,
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
        allowNull: false,
        type: DataTypes.BOOLEAN,
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
      tableName: 'tableId',
      modelName: 'tableId',
      sequelize,
    },
  );

  return tableIdModel;
}
