import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';

export type AlertRuleCreationAttributes = Optional<
  IAlertRule,
  | 'alertRuleKey'
  | 'customerAccountKey'
  | 'alertRuleId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'alertRuleName'
  | 'alertRuleGroup'
  | 'alertRuleQuery'
  | 'alertRuleDuration'
  | 'alertRuleState'
  | 'alertRuleSeverity'
  | 'alertRuleDescription'
  | 'alertRuleSummary'
  | 'alertRuleRunbook'
  | 'alertRuleMlGroup'
  | 'alertRuleMlSubGroup'
  | 'resourceGroupUuid'
>;

export class AlertRuleModel extends Model<IAlertRule, AlertRuleCreationAttributes> implements IAlertRule {
  public alertRuleKey: number;
  public customerAccountKey: number;
  public alertRuleId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public alertRuleName: string;
  public alertRuleGroup: string;
  public alertRuleState: string;
  public alertRuleQuery: string;
  public alertRuleDuration: number;
  public alertRuleSeverity: string;
  public alertRuleDescription: string;
  public alertRuleSummary: string;
  public alertRuleRunbook: string;
  public alertRuleMlGroup: string;
  public alertRuleMlSubGroup: string;
  public resourceGroupUuid: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AlertRuleModel {
  AlertRuleModel.init(
    {
      alertRuleKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      alertRuleId: {
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
  

      alertRuleName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertRuleGroup: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertRuleState: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertRuleQuery: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      alertRuleDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      alertRuleSeverity: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertRuleDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alertRuleSummary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alertRuleRunbook: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertRuleMlGroup: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      alertRuleMlSubGroup: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      resourceGroupUuid: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
          },

    {
      tableName: 'AlertRule',
      modelName: 'AlertRule',
      sequelize,
    },
  );

  return AlertRuleModel;
}