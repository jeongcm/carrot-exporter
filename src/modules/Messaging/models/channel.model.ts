import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Channel } from '@/common/interfaces/channel.interface';
import { ChannelType } from '@/types';

export type ChannelCreationAttributes = Optional<
  Channel,
  'id' | 'channelType' | 'name' | 'description' | 'configJSON' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class ChannelModel extends Model<Channel, ChannelCreationAttributes> implements Channel {
  public id: number;
  public uuid: string;
  public channelType: ChannelType;
  public name: string;
  public description: string;
  public configJSON: string;
  public createdBy: number;
  public updatedBy: number;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ChannelModel {
  ChannelModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      uuid: {
        primaryKey: false,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      channelType: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      configJSON: {
        allowNull: true,
        type: DataTypes.STRING(),
      },
      createdAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      createdBy: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
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
