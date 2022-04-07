import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Notification } from '@/common/interfaces/notification.interface';

export type NotificationCreationAttributes = Optional<
Notification,
  'notificationKey' | 'notificationId' | 'partyChannelKey' | 'partyKey' | 'messageKey' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'isDeleted' | 
  'notificationStatus'|'notificationStatutsUpdatedAt'|'customerAccountKey'
>;

export class NotificationModel extends Model<Notification, NotificationCreationAttributes> implements Notification {
  public notificationKey: number;
  public notificationId: string;
  public partyChannelKey: number;
  public partyKey: number;
  public messageKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public notificationStatus: string;
  public notificationStatutsUpdatedAt: Date;
  public customerAccountKey: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      partyChannelKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      partyKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      messageKey: {
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      createdBy: {
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
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
              args: [['CR', 'SM',null]],
              msg: " notificationStatus must be of type  ['CR', 'SM'] SM: Sent, CR: Created"
          }
      }
      },
      notificationStatutsUpdatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      customerAccountKey: {
        allowNull: true,
        type: DataTypes.INTEGER,
      }
    },
    {
      tableName: 'Notification',
      modelName: 'Notification',
      sequelize,
    }
  );

  return NotificationModel;
}
