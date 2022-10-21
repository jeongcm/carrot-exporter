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
  | 'resourceGroupUuid'
  | 'alertTargetSubGroupKey'
  | 'customerAccountKey'
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
  public alertRuleKey: number;
  public alertTargetSubGroupKey: number;
  public alertEasyRuleDuration: number;
  public alertEasyRuleThreshold1: number;
  public alertEasyRuleThreshold2: number;
  public alertEasyRuleQuery: string;
  public customerAccountKey: number;
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
        type: DataTypes.STRING(30),
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
        type: DataTypes.TEXT,
        allowNull: true,
      },
      alertEasyRuleDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      alertEasyRuleThreshold1: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      alertEasyRuleDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alertEasyRuleThreshold2: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      alertRuleKey: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      alertTargetSubGroupKey: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      resourceGroupUuid: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      customerAccountKey: {
        type: DataTypes.NUMBER,
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
