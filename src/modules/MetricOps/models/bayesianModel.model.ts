import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IBayesianModel, IBayesianDBModel } from '@/common/interfaces/bayesianModel.interface';

export type BayesianModelAttributes = Optional<
  IBayesianDBModel,
  | 'bayesianModelKey'
  | 'bayesianModelId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'bayesianModelName'
  | 'bayesianModelDescription'
  | 'bayesianModelStatus'
  | 'customerAccountKey'
  | 'bayesianModelResourceType'
  | 'bayesianModelScoreCard'
  | 'resourceGroupKey'
  | 'version'
  | 'standardModelId'
>;

export class BayesianModelTable extends Model<IBayesianDBModel, BayesianModelAttributes> implements IBayesianDBModel {
  public bayesianModelKey: number;
  public bayesianModelId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public bayesianModelName: string;
  public bayesianModelDescription: string;
  public bayesianModelStatus: string;
  public customerAccountKey: number;
  public resourceGroupKey: number;
  public bayesianModelScoreCard: JSON;
  public bayesianModelResourceType: 'ND' | 'SV' | 'PD' | 'PC';
  public version: string;
  public standardModelId: string;

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
        type: DataTypes.STRING(100),
        unique: true,
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
      bayesianModelDescription: {
        type: DataTypes.STRING(100),
      },
      bayesianModelStatus: {
        type: DataTypes.STRING(2),
      },
      version: {
        type: DataTypes.STRING(10),
      },
      resourceGroupKey: {
        type: DataTypes.INTEGER,
      },
      bayesianModelScoreCard: {
        type: DataTypes.JSON(),
      },
      customerAccountKey: {
        type: DataTypes.INTEGER,
      },
      standardModelId: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },

      bayesianModelResourceType: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['ND', 'SV', 'PD', 'PC']],
            msg: "bayesianModelResourceType must be of type  [ 'ND'|'SV'|'PD'|'PC' ]  Where  - ND (Node)  - SV (Service) - PD (Pod) - PC (PVC)",
          },
        },
      },
    },
    {
      tableName: 'BayesianModel',
      modelName: 'BayesianModel',
      indexes: [
        {
          unique: true,
          fields: ['bayesian_model_id'],
        },
      ],
      sequelize,
    },
  );

  return BayesianModelTable;
}
