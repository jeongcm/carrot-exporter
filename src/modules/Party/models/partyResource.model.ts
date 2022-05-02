import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IPartyResource } from '@/common/interfaces/party.interface';

export type PartyResourceAttributes = Optional<
  IPartyResource,
  'partyResourceKey' | 'partyKey' | 'resourceKey' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class PartyResourceModel extends Model<IPartyResource, PartyResourceAttributes> implements IPartyResource {
  public partyResourceKey: number;
  public partyResourceId: string;
  public partyKey: number;
  public resourceKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof PartyResourceModel {
  PartyResourceModel.init(
    {
      partyResourceKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      partyResourceId: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      partyKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resourceKey: {
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
      tableName: 'PartyResource',
      modelName: 'PartyResource',
      indexes: [
        {
          unique: true,
          fields: ['party_resource_id'],
        },
      ],
      sequelize,
    },
  );

  return PartyResourceModel;
}
