import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IBayesianModel } from '@/common/interfaces/bayesianModel.interface';

export type BayesianModelAttributes = Optional<
  IBayesianModel,
  | 'bayesianModelKey'
  | 'bayesianModelId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'bayesianModelName'
  | 'baysianModelDescription'
  | 'baysianModelStatus'
  | 'customerAccountKey'
  | 'baysianModelResourceType'
>;

export class BayesianModelTable extends Model<IBayesianModel, BayesianModelAttributes> implements IBayesianModel {
  public bayesianModelKey: number;
  public bayesianModelId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public bayesianModelName: string;
  public baysianModelDescription: string;
  public baysianModelStatus: string;
  public customerAccountKey: number;
  public baysianModelResourceType: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof BayesianModelTable {
  BayesianModelTable.init(
    {
      bayesianModelKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      bayesianModelId: {
        allowNull: false,
        type: DataTypes.STRING(16),
        unique: true
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      bayesianModelName: {
        type: DataTypes.STRING(100),
      },
      baysianModelDescription: {
        type: DataTypes.STRING(2),
      },
      baysianModelStatus: {
        type: DataTypes.STRING(2),
      },
      customerAccountKey: {
        type: DataTypes.INTEGER,
      },
      baysianModelResourceType: {
        type: DataTypes.STRING(2),
      }
    },
    {
      tableName: 'BayesianModel',
      modelName: 'BayesianModel',
      sequelize,
    },
  );

  return BayesianModelTable;
}
