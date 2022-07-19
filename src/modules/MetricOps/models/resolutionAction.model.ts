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
  public resolutionActionTemplateSteps:JSON;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
        type: DataTypes.STRING(16),
        unique: true
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        type: DataTypes.STRING(16),
        allowNull:true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull:true
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull:true
      },
      resolutionActionName: {
        type: DataTypes.STRING(100),
        allowNull:false
      },
      resolutionActionDescription: {
        type: DataTypes.STRING(500),
        allowNull:false
      },
      resolutionActionTemplateSteps: {
        type: DataTypes.JSON
      },
      sudoryTemplateKey: {
        type: DataTypes.INTEGER,
        allowNull:false
      }
    },
    {
      tableName: 'ResolutionAction',
      modelName: 'ResolutionAction',
      indexes: [
        {
          unique: true,
          fields: ['resolution_action_id'],
        },
      ],
      sequelize,
    },
  );

  return ResolutionActionModel;
}
