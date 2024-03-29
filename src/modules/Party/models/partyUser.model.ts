//import { PartyModel } from './party.model';
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
  | 'timezone'
  | 'adminYn'
  | 'systemYn'
  | 'language'
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
  public socialProviderId: string;
  public partyUserStatus: 'DR' | 'AC' | 'IN';
  public isEmailValidated: boolean;
  public emailValidatedAt: Date;
  public token: string;
  public lastAccessAt: Date;
  public timezone: string;
  public adminYn: boolean;
  public systemYn: boolean;
  public updatedAt: Date;
  public language: string;
  public oldPassword: any;

  public readonly createdAt!: Date;
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
        unique: true,
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
        unique: true,
      },
      socialProviderId: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      adminYn: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      systemYn: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      partyUserStatus: {
        type: DataTypes.STRING(2),
        allowNull: true,
        defaultValue: 'AC',
        validate: {
          isIn: {
            args: [['DR', 'AC', 'CA']], // DRAFT, ACTIVE, CANCELLED
            msg: " subscriptionStatus must be of type  ['DR' | 'AC' | 'CA']",
          },
        },
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
      timezone: {
        type: DataTypes.STRING(100),
      },
      language: {
        type: DataTypes.STRING(2),
        defaultValue: 'EN', //EN, KR,
      },
      oldPassword: {
        type: DataTypes.JSON,
        // defaultValue: [],
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
