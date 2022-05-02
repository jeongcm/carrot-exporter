import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IPartyUserLogs } from '@/common/interfaces/party.interface';

export type PartyUserLogsAttributes = Optional<
  IPartyUserLogs,
  'partyUserLogsKey' | 'partyUserLogsId' | 'partyUserKey' | 'apiKey' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class PartyUserLogsModel extends Model<IPartyUserLogs, PartyUserLogsAttributes> implements IPartyUserLogs {
  public partyUserLogsKey: number;
  public partyUserLogsId: string;
  public partyUserKey: number;
  public apiKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof PartyUserLogsModel {
  PartyUserLogsModel.init(
    {
      partyUserLogsKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      partyUserLogsId: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      partyUserKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      apiKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'PartyUserLogs',
      modelName: 'PartyUserLogs',
      indexes: [
        {
          unique: true,
          fields: ['party_user_logs_id'],
        },
      ],
      sequelize,
    },
  );

  return PartyUserLogsModel;
}
