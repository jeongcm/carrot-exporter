import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupChannel } from '@/common/interfaces/accessGroupChannel.interface';

export type AccessGroupChannelCreationAttributes = Optional<
  AccessGroupChannel,
  'id' | 'pk' | 'accessGroupPk' | 'channelPk' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupChannelModel extends Model<AccessGroupChannel, AccessGroupChannelCreationAttributes> implements AccessGroupChannel {
  public pk: number;
  public id: string;
  public accessGroupPk: number;
  public channelPk: number;
  public createdBy: number;
  public updatedBy: number;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupChannelModel {
  AccessGroupChannelModel.init(
    {
      pk: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      id: {
        primaryKey: false,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      accessGroupPk: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      channelPk: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      updatedBy: {
        allowNull: false,
        type: DataTypes.UUID,
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
