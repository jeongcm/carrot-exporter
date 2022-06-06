import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IRoleParty } from '@/common/interfaces/role.interface';

export type rolePartyAttributes = Optional<
  IRoleParty,
  'rolePartyKey' | 'rolePartyId' | 'roleKey' | 'partyKey' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class RolePartyModel extends Model<IRoleParty, rolePartyAttributes> implements IRoleParty {
  public rolePartyKey: number;
  public rolePartyId: string;
  public roleKey: number;
  public partyKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public updatedAt: Date;

  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof RolePartyModel {
  RolePartyModel.init(
    {
      rolePartyKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      rolePartyId: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      roleKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      partyKey: {
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
      tableName: 'RoleParty',
      modelName: 'RoleParty',
      indexes: [
        {
          unique: true,
          fields: ['role_party_id'],
        },
      ],
      sequelize,
    },
  );

  return RolePartyModel;
}
