import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { PartyChannel } from '@/common/interfaces/party.interface';

export type PartyChannelAttributes = Optional<
  PartyChannel,
  'partyChannelKey' | 'partyKey' | 'channelKey' | 'PartychannelId' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'partyChannelFrom' | 'partyChannelTo' | 'partyChannelDefault'
>;

export class PartyChannelModel extends Model<PartyChannel, PartyChannelAttributes> implements PartyChannel {
  public partyChannelKey: number;
  public partyKey: number;
  public channelKey: number;
  public PartychannelId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public partyChannelFrom: Date;
  public partyChannelTo: Date;
  public partyChannelDefault: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof PartyChannelModel {
  PartyChannelModel.init(
    {
      partyChannelKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      partyKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      channelKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      PartychannelId: {
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
      createdAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      deletedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      partyChannelFrom: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      partyChannelTo: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      partyChannelDefault: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      tableName: 'PartyChannel',
      modelName: 'PartyChannel',
      sequelize,
    },
  );

  return PartyChannelModel;
}
