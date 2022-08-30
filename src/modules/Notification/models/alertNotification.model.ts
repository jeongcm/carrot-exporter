import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AlertNotification } from '@/common/interfaces/notification.interface';

export type AlertNotificationCreationAttributes = Optional<
  AlertNotification,
  | 'alertNotificationKey'
  | 'alertNotificationId'
  | 'partyKey'
  | 'templateKey'
  | 'contentJson'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'queueId'
  | 'queueStatus'
  | 'queueStatusUpdatedAt'
  | 'alertNotificationStatus'
  | 'alertNotificationStatutsUpdatedAt'
  | 'customerAccountKey'
>;

export class AlertNotificationModel extends Model<AlertNotification, AlertNotificationCreationAttributes> implements AlertNotification {
  public alertNotificationKey: number;
  public alertNotificationId: string;
  public partyKey: number;
  public templateKey: number; // <--- to implment in the future. For now hard coded
  public contentJson: any;
  public queueId: string;
  public queueStatus: string;
  public queueStatusUpdatedAt: Date;
  public alertNotificationStatus: string;
  public alertNotificationStatutsUpdatedAt: Date;
  public customerAccountKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AlertNotificationModel {
  AlertNotificationModel.init(
    {
      alertNotificationKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      alertNotificationId: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      partyKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      templateKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      contentJson: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      queueId: {
        allowNull: false,
        type: DataTypes.STRING(32),
      },
      queueStatus: {
        allowNull: false,
        type: DataTypes.STRING(2),
      },
      queueStatusUpdatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      alertNotificationStatus: {
        allowNull: true,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['CR', 'SM', null]],
            msg: " alertNotificationStatus must be of type  ['CR', 'SM'] SM: Sent, CR: Created",
          },
        },
      },
      alertNotificationStatutsUpdatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      customerAccountKey: {
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
    },
    {
      tableName: 'AlertNotification',
      modelName: 'AlertNotification',
      sequelize,
    },
  );

  return AlertNotificationModel;
}
