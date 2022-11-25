import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IResolutionAction } from '@/common/interfaces/resolutionAction.interface';

export type ResolutionActionAttributes = Optional<
  IResolutionAction,
  | 'resolutionActionKey'
  | 'resolutionActionId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'resolutionActionName'
  | 'resolutionActionDescription'
  | 'sudoryTemplateKey'
  | 'resolutionActionTemplateSteps'
  | 'resolutionActionType'
  | 'resolutionActionPrerequisiteKey'
  | 'customerAccountKey'
>;
export class ResolutionActionModel extends Model<IResolutionAction, ResolutionActionAttributes> implements IResolutionAction {
  public resolutionActionKey: number;
  public resolutionActionId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public resolutionActionName: string;
  public resolutionActionDescription: string;
  public sudoryTemplateKey: number;
  public resolutionActionTemplateSteps: JSON;
  public resolutionActionType: string; // 'IA' - incident action + metricOps, 'MO' - metricOps
  public resolutionActionPrerequisiteKey: number;
  public readonly createdAt!: Date;
  public updatedAt: Date;
  public customerAccountKey: number;
}

export default function (sequelize: Sequelize): typeof ResolutionActionModel {
  ResolutionActionModel.init(
    {
      resolutionActionKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      resolutionActionId: {
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
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resolutionActionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      resolutionActionDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      resolutionActionTemplateSteps: {
        type: DataTypes.JSON,
      },
      sudoryTemplateKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resolutionActionType: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      resolutionActionPrerequisiteKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      customerAccountKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'ResolutionAction',
      modelName: 'ResolutionAction',
      indexes: [
        {
          fields: ['customer_account_key'],
        },
      ],
      sequelize,
    },
  );

  return ResolutionActionModel;
}
