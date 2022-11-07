import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAlertEasyRule } from '@/common/interfaces/alertEasyRule.interface';

export type AlertEasyRuleCreationAttributes = Optional<
  IAlertEasyRule,
  | 'alertEasyRuleKey'
  | 'alertEasyRuleId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'alertEasyRuleName'
  | 'alertEasyRuleDescription'
  | 'alertEasyRuleQuery'
  | 'alertEasyRuleDuration'
  | 'alertEasyRuleThreshold1'
  | 'alertEasyRuleThreshold2'
  | 'alertEasyRuleThreshold1Unit'
  | 'alertEasyRuleThreshold2Unit'
  | 'alertEasyRuleThreshold1Max'
  | 'alertEasyRuleThreshold2Max'
  | 'resourceGroupUuid'
  | 'resourceGroupKey'
  | 'alertTargetSubGroupKey'
  | 'customerAccountKey'
  | 'alertEasyRuleGroup'
  | 'alertEasyRuleSeverity'
  | 'alertEasyRuleSummary'
>;

export class AlertEasyRuleModel extends Model<IAlertEasyRule, AlertEasyRuleCreationAttributes> implements IAlertEasyRule {
  public alertEasyRuleKey: number;
  public alertEasyRuleId: string;
  public createdBy: string;
  public updatedBy: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  public alertEasyRuleName: string;
  public alertEasyRuleDescription: string;
  public resourceGroupUuid: string;
  public resourceGroupKey: number;
  public alertTargetSubGroupKey: number;
  public alertEasyRuleDuration: string;
  public alertEasyRuleThreshold1: string;
  public alertEasyRuleThreshold2: string;
  public alertEasyRuleThreshold1Unit: string;
  public alertEasyRuleThreshold2Unit: string;
  public alertEasyRuleThreshold1Max: string;
  public alertEasyRuleThreshold2Max: string;
  public alertEasyRuleQuery: string;
  public customerAccountKey: number;
  public alertEasyRuleGroup: string;
  public alertEasyRuleSeverity: string;
  public alertEasyRuleSummary: string;
}

export default function (sequelize: Sequelize): typeof AlertEasyRuleModel {
  AlertEasyRuleModel.init(
    {
      alertEasyRuleKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      alertEasyRuleId: {
        allowNull: false,
        type: DataTypes.STRING(50),
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
      alertEasyRuleName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertEasyRuleQuery: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      alertEasyRuleDuration: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      alertEasyRuleThreshold1: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      alertEasyRuleDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alertEasyRuleSummary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alertEasyRuleGroup: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertEasyRuleSeverity: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertEasyRuleThreshold2: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      alertEasyRuleThreshold1Unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      alertEasyRuleThreshold2Unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      alertEasyRuleThreshold1Max: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      alertEasyRuleThreshold2Max: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      alertTargetSubGroupKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resourceGroupUuid: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      resourceGroupKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customerAccountKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'AlertEasyRule',
      modelName: 'AlertEasyRule',
      sequelize,
    },
  );

  return AlertEasyRuleModel;
}
