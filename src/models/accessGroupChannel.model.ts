import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupChannel } from '@interfaces/accessGroupChannel.interface';

export type AccessGroupChannelCreationAttributes = Optional<
  AccessGroupChannel,
 'id'|'accessGroupId' | 'channelId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupChannelModel extends Model<AccessGroupChannel, AccessGroupChannelCreationAttributes> implements AccessGroupChannel {
  public id: string;
  public accessGroupId: string;
  public channelId: string;
  public createdBy: string;
  public updatedBy: string;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupChannelModel {
  AccessGroupChannelModel.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,      
      },
      accessGroupId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      channelId: {
        allowNull: false,
        type: DataTypes.UUID,
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
      modelName: "AccessGroupChannel",
      sequelize,
    },
  );

  return AccessGroupChannelModel;
}
