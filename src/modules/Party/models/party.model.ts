import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

import { IParty } from '@/common/interfaces/party.interface';

export type PartyCreationAttributes = Optional<
  IParty,
  | 'partyKey'
  | 'partyId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'isDeleted'
  | 'partyName'
  | 'partyDescription'
  | 'parentPartyId'
  | 'partyType'
  | 'customerAccountKey'
>;

export class PartyModel extends Model<IParty, PartyCreationAttributes> implements IParty {
  public partyKey: number;
  public partyId: string;
  public createdBy: string;
  public updatedBy: string;
  public isDeleted: boolean;

  public partyName: string;
  public partyDescription: string;
  public parentPartyId: string;
  public partyType: 'US' | 'AG';
  public customerAccountKey: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof PartyModel {
  PartyModel.init(
    {
      partyKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      partyId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
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
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      partyName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      partyDescription: {
        type: DataTypes.STRING(500),
      },
      parentPartyId: {
        type: DataTypes.STRING(16),
      },
      partyType: {
        type: DataTypes.STRING(2),
      },
      customerAccountKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'Party',
      modelName: 'Party',
      sequelize,
    },
  );

  return PartyModel;
}
