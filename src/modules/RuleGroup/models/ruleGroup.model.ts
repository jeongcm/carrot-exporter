import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type RuleGroupAttributes = Optional<
  IRuleGroup,
  | 'ruleGroupKey'
  | 'ruleGroupId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'ruleGroupName'
  | 'ruleGroupDescription'
  | 'ruleGroupStatus'
>;

export class RuleGroupModel extends Model<IRuleGroup, RuleGroupAttributes > implements IRuleGroup {

    public 'ruleGroupKey': number;
    public 'ruleGroupId': string;
    public 'createdBy': string;
    public 'updatedBy': string;
    public 'deletedAt': Date;
    public 'ruleGroupName': string; 
    public 'ruleGroupDescription': string;
    public 'ruleGroupStatus': string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

}

export default function (sequelize: Sequelize): typeof RuleGroupModel {
    RuleGroupModel.init(
    {
        ruleGroupKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      ruleGroupId: {
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
      ruleGroupName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      ruleGroupDescription: {
        type: DataTypes.STRING(2)
      },
      ruleGroupStatus: {
        type: DataTypes.STRING(2),
        allowNull: true,
      }
    },

    {
      tableName: 'RuleGroup',
      modelName: 'RuleGroup',
      sequelize,
    },
  );

  return RuleGroupModel;
}