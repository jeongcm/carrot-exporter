import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAlertTargetSubGroup } from '@/common/interfaces/alertTargetSubGroup.interface';

export type AlertTargetSubGroupCreationAttributes = Optional<
  IAlertTargetSubGroup,
  | 'alertTargetSubGroupKey'
  | 'alertTargetSubGroupId'
  | 'alertTargetSubGroupName'
  | 'alertTargetSubGroupDescription'
  | 'alertTargetGroupKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class AlertTargetSubGroupModel extends Model<IAlertTargetSubGroup, AlertTargetSubGroupCreationAttributes> implements IAlertTargetSubGroup {
  public alertTargetSubGroupKey: number;
  public alertTargetSubGroupId: string;
  public createdBy: string;
  public updatedBy: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  public alertTargetGroupKey: number;
  public alertTargetSubGroupName: string;
  public alertTargetSubGroupDescription: string;
}

export default function (sequelize: Sequelize): typeof AlertTargetSubGroupModel {
  AlertTargetSubGroupModel.init(
    {
      alertTargetSubGroupKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },

      alertTargetGroupKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },

      alertTargetSubGroupId: {
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
      alertTargetSubGroupName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, //don't drop unique index of roleName
      },
      alertTargetSubGroupDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
    },
    {
      tableName: 'AlertTargetSubGroup',
      modelName: 'AlertTargetSubGroup',
      sequelize,
    },
  );

  return AlertTargetSubGroupModel;
}
