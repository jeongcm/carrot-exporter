import { IRuleGroupAlertRule } from '@/common/interfaces/ruleGroupAlertRule.interface';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type RuleGroupAlertRuleAttributes = Optional<
  IRuleGroupAlertRule,
  | 'ruleGroupAlertRuleKey'
  | 'ruleGroupKey'
  | 'alertRuleKey'
  | 'ruleGroupAlertRuleId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'ruleGroupAlertRuleStatus'
>;

export class RuleGroupAlertRuleModel extends Model<IRuleGroupAlertRule, RuleGroupAlertRuleAttributes> implements IRuleGroupAlertRule {
  public 'ruleGroupAlertRuleKey': number;
  public 'ruleGroupKey': number;
  public 'alertRuleKey': number;
  public 'ruleGroupAlertRuleId': string;
  public 'createdBy': string;
  public 'updatedBy': string;
  public 'deletedAt': Date;
  public 'ruleGroupAlertRuleStatus': string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof RuleGroupAlertRuleModel {
  RuleGroupAlertRuleModel.init(
    {
      ruleGroupAlertRuleKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      ruleGroupKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      alertRuleKey:{
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      ruleGroupAlertRuleId:{
        allowNull: false,
        type: DataTypes.STRING(16),
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
      ruleGroupAlertRuleStatus: {
        type: DataTypes.STRING(2),
        allowNull: false,
      }
    },

    {
      tableName: 'RuleGroupAlertRule',
      modelName: 'RuleGroupAlertRule',
      sequelize,
    },
  );

  return RuleGroupAlertRuleModel;
}
