import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Notification } from '@/common/interfaces/notification.interface';

export type NotificationCreationAttributes = Optional<
  Notification,
  | 'notificationKey'
  | 'notificationId'
  | 'partyKey'
  | 'messageKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'notificationStatus'
  | 'notificationStatutsUpdatedAt'
  | 'notificationJson'
  | 'customerAccountKey'
>;

export class NotificationModel extends Model<Notification, NotificationCreationAttributes> implements Notification {
  public notificationKey: number;
  public notificationId: string;
  public partyKey: number;
  public messageKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public notificationStatus: string;
  public notificationStatutsUpdatedAt: Date;
  public customerAccountKey: number;
  public updatedAt: Date;
  public notificationJson: JSON;

  public readonly createdAt!: Date;
  
}

export default function (sequelize: Sequelize): typeof NotificationModel {
  NotificationModel.init(
    {
      notificationKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      notificationId: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      partyKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      messageKey: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      createdBy: {
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        defaultValue: null,
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      notificationStatus: {
        allowNull: true,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['CR', 'ST', null]],
            msg: " notificationStatus must be of type  ['CR', 'ST'] SM: Sent, CR: Created",
          },
        },
      },
      notificationJson:{
        allowNull: true,
        type: DataTypes.JSON,
      },
      notificationStatutsUpdatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      customerAccountKey: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'Notification',
      modelName: 'Notification',
      sequelize,
    },
  );

  return NotificationModel;
}
