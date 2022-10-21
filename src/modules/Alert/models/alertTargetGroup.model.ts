import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAlertTargetGroup } from '@/common/interfaces/alertTargetGroup.interface';

export type AlertTargetGroupCreationAttributes = Optional<
  IAlertTargetGroup,
  | 'alertTargetGroupKey'
  | 'alertTargetGroupId'
  | 'alertTargetGroupName'
  | 'alertTargetGroupDescription'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class AlertTargetGroupModel extends Model<IAlertTargetGroup, AlertTargetGroupCreationAttributes> implements IAlertTargetGroup {
  public alertTargetGroupKey: number;
  public alertTargetGroupId: string;
  public createdBy: string;
  public updatedBy: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  public alertTargetGroupName: string;
  public alertTargetGroupDescription: string;
}

export default function (sequelize: Sequelize): typeof AlertTargetGroupModel {
  AlertTargetGroupModel.init(
    {
      alertTargetGroupKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },

      alertTargetGroupId: {
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
      alertTargetGroupName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertTargetGroupDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
    },
    {
      tableName: 'AlertTargetGroup',
      modelName: 'AlertTargetGroup',
      sequelize,
    },
  );

  return AlertTargetGroupModel;
}
