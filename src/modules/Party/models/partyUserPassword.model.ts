//import { PartyModel } from './party.model';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IPartyUserPassword } from '@/common/interfaces/party.interface';

export type PartyUserPasswordCreationAttributes = Optional<
  IPartyUserPassword,
  | 'partyUserPasswordKey'
  | 'partyUserPasswordId'
  | 'partyUserKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'password'
  | 'partyUserPasswordStatus' //'AC' for active password, 'IN' for inactive passwords
>;

export class PartyUserPasswordModel extends Model<IPartyUserPassword, PartyUserPasswordCreationAttributes> implements IPartyUserPassword {
  public partyUserPasswordKey: number;
  public partyUserPasswordId: string;
  public partyUserKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public updatedAt: Date;
  public password: string;
  public partyUserPasswordStatus: string;
  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof PartyUserPasswordModel {
  PartyUserPasswordModel.init(
    {
      partyUserPasswordKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      partyUserPasswordId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      partyUserKey: {
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
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      partyUserPasswordStatus: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
    },
    {
      tableName: 'PartyUserPassword',
      modelName: 'PartyUserPassword',
      sequelize,
    },
  );

  return PartyUserPasswordModel;
}
