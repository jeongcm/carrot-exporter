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
  | 'timezone'
  | 'adminYn'
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
  public updatedAt: Date;

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
      socialProviderId: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      adminYn: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      partyUserStatus: {
        type: DataTypes.STRING(2),
        allowNull: true,
        defaultValue: 'AC',
        validate: {
          isIn: {
            args: [['DR', 'AC', 'IN']], // DRAFT, ACTIVE, INACTIVE
            msg: " subscriptionStatus must be of type  ['DR' | 'AC' | 'IN']",
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
    },
    {
      tableName: 'PartyUser',
      modelName: 'PartyUser',
      sequelize,
    },
  );

  return PartyUserModel;
}
