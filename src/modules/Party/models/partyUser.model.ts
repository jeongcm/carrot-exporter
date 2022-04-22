import { PartyModel } from './party.model';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IPartyUser } from '@/common/interfaces/party.interface';

export type PartyUserCreationAttributes = Optional<
  IPartyUser,
  | 'partyUserKey'
  | 'partyUserId'
  | 'partyKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'firstName'
  | 'lastName'
  | 'userId'
  | 'mobile'
  | 'password'
  | 'email'
  | 'isEmailValidated'
  | 'emailValidatedAt'
  | 'token'
  | 'lastAccessAt'
  | 'partyUserStatus'
>;

export class PartyUserModel extends Model<IPartyUser, PartyUserCreationAttributes> implements IPartyUser {
  public partyUserKey: number;
  public partyUserId: string;
  public partyKey: number;

  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public firstName: string;
  public lastName: string;
  public userId: string;
  public mobile: string;
  public password: string;
  public email: string;
  public partyUserStatus: "DRAFT" | "ACTIVE" | "INACTIVE";
  public isEmailValidated: boolean;
  public emailValidatedAt: Date;
  public token: string;
  public lastAccessAt: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof PartyUserModel {
  PartyUserModel.init(
    {
      partyUserKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      partyUserId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
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
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING(50),
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      partyUserStatus: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "ACTIVE",
        validate: {
          isIn: {
              args: [['DRAFT' , 'ACTIVE' , 'INACTIVE']],
              msg: " subscriptionStatus must be of type  ['DRAFT' | 'ACTIVE' | 'INACTIVE']"
          }
      }
      },
      isEmailValidated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emailValidatedAt: {
        type: DataTypes.DATE,
      },
      token: {
        type: DataTypes.STRING(500),
      },
      lastAccessAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'PartyUser',
      modelName: 'PartyUser',
      sequelize,
    },
  );

  return PartyUserModel;
}
