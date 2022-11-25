import { IRuleGroupResolutionAction } from '@/common/interfaces/ruleGroupResolutionAction.interface';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type RuleGroupResolutionActionAttributes = Optional<
  IRuleGroupResolutionAction,
  | 'ruleGroupResolutionActionKey'
  | 'ruleGroupKey'
  | 'resolutionActionKey'
  | 'ruleGroupResolutionActionId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'resolutionActionDescription'
  | 'sudoryTemplateArgsOption'
>;

export class RuleGroupResolutionActionModel
  extends Model<IRuleGroupResolutionAction, RuleGroupResolutionActionAttributes>
  implements IRuleGroupResolutionAction
{
  public ruleGroupResolutionActionKey: number;
  public ruleGroupKey: number;
  public resolutionActionKey: number;
  public ruleGroupResolutionActionId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public resolutionActionDescription: string;
  public sudoryTemplateArgsOption: JSON;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof RuleGroupResolutionActionModel {
  RuleGroupResolutionActionModel.init(
    {
      ruleGroupResolutionActionKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      ruleGroupKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      resolutionActionKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      ruleGroupResolutionActionId: {
        allowNull: false,
        type: DataTypes.STRING(100),
        unique: true,
      },
      createdBy: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.STRING(16),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE(),
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
      resolutionActionDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      sudoryTemplateArgsOption: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },

    {
      tableName: 'RuleGroupResolutionAction',
      modelName: 'RuleGroupResolutionAction',
      sequelize,
    },
  );

  return RuleGroupResolutionActionModel;
}
