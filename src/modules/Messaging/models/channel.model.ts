import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Channel } from '@/common/interfaces/channel.interface';
import { ChannelType } from '@/common/types';

export type ChannelCreationAttributes = Optional<
  Channel,
  'channelKey' | 'customerAccountId' | 'channelId' | 'createdBy' | 'updatedBy' | 'isDeleted' | 'channelName' | 'channelDescription' | 'channelType' | 'channelAdaptor'
>;

export class ChannelModel extends Model<Channel, ChannelCreationAttributes> implements Channel {
  public channelKey: number;
  public customerAccountId: string;
  public channelId: string;
  public createdBy: string;
  public updatedBy: string;
  public isDeleted: boolean;
  public channelName: string;
  public channelDescription: string;
  public channelType: ChannelType;
  public channelAdaptor: string;

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
      customerAccountId: {
        allowNull: false,
        type: DataTypes.STRING(16),
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
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
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
        type: DataTypes.STRING(),
      },
      createdAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'Channel',
      modelName: 'Channel',
      sequelize,
    },
  );

  return ChannelModel;
}
