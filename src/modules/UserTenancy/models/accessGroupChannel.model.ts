import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupChannel } from '@/common/interfaces/accessGroupChannel.interface';

export type AccessGroupChannelCreationAttributes = Optional<
  AccessGroupChannel,
  'id' | 'uuid' | 'accessGroupId' | 'channelId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupChannelModel extends Model<AccessGroupChannel, AccessGroupChannelCreationAttributes> implements AccessGroupChannel {
  public id: number;
  public uuid: string;
  public accessGroupId: number;
  public channelId: number;
  public createdBy: number;
  public updatedBy: number;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupChannelModel {
  AccessGroupChannelModel.init(
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
      accessGroupId: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      channelId: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      updatedBy: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'AccessGroupChannel',
      modelName: 'AccessGroupChannel',
      sequelize,
    },
  );

  return AccessGroupChannelModel;
}
