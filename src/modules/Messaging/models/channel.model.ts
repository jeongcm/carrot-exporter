import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Channel } from '@/common/interfaces/channel.interface';
import { ChannelType } from '@/common/types';

export type ChannelCreationAttributes = Optional<
  Channel,
  'channelKey' | 'customerAccountKey' | 'channelId' | 'createdBy' | 'updatedBy' | 'deletedAt' | 'channelName' | 'channelDescription' | 'channelType' | 'channelAdaptor'
>;

export class ChannelModel extends Model<Channel, ChannelCreationAttributes> implements Channel {
  public channelKey: number;
  public customerAccountKey: number;
  public channelId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public channelName: string;
  public channelDescription: string;
  public channelType: ChannelType;
  public channelAdaptor: JSON;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ChannelModel {
  ChannelModel.init(
    {
      channelKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      channelId: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      channelName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      channelDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      channelType: {
        allowNull: false,
        type: DataTypes.STRING(8),
      },
      channelAdaptor: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {indexes: [
      { // new index
        unique: true,
        fields: ['channel_id'],
      }
    ],
      tableName: 'Channel',
      modelName: 'Channel',
      sequelize,
    }
  );

  return ChannelModel;
}
