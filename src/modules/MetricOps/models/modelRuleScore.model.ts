import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IBayesianModel } from '@/common/interfaces/bayesianModel.interface';
import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';

export type ModelRuleScoreAttributes = Optional<
  IModelRuleScore,
  | 'modelRuleScoreKey'
  | 'modelRuleScoreId'
  | 'ruleGroupKey'
  | 'bayesianModelKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'scoreCard'
>;

export class ModelRuleScoreTable extends Model<IModelRuleScore, ModelRuleScoreAttributes> implements IModelRuleScore {
  public modelRuleScoreKey: number;
  public ruleGroupKey: number;
  public bayesianModelKey: number;
  public modelRuleScoreId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public scoreCard: JSON;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ModelRuleScoreTable {
  ModelRuleScoreTable.init(
    {
      modelRuleScoreKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      modelRuleScoreId: {
        allowNull: false,
        type: DataTypes.STRING(100),
        unique: true,
      },
      bayesianModelKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ruleGroupKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      scoreCard: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: 'ModelRuleScore',
      modelName: 'ModelRuleScore',
      indexes: [
        {
          unique: true,
          fields: ['model_rule_score_id'],
        },
      ],
      sequelize,
    },
  );

  return ModelRuleScoreTable;
}
