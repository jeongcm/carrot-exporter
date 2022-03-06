import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { User } from '@/common/interfaces/users.interface';
import { TenancyModel } from './tenancy.model';

export type UserCreationAttributes = Optional<
  User,
  | 'id'
  | 'email'
  | 'password'
  | 'username'
  | 'firstName'
  | 'lastAccess'
  | 'lastName'
  | 'mobile'
  | 'photo'
  | 'createdAt'
  | 'updatedAt'
  | 'currentTenancyId'
  | 'token'
  | 'socialProviderId'
>;

export class UserModel extends Model<User, UserCreationAttributes> implements User {
  public id: string;
  public email: string;
  public password: string;
  public username: string;
  public firstName: string;
  public lastName: string;
  public socialProviderId: string;
  public mobile: string;
  public photo: string;
  public currentTenancyId: string;
  public isEmailValidated: boolean;
  public emailValidatedOn: Date;
  public token: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly lastAccess!: Date;
}

export default function (sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      uuid: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      firstName: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      lastName: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      mobile: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      photo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      socialProviderId: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      password: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      isEmailValidated: {
        allowNull: true,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailValidatedOn: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      token: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      currentTenancyId: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      createdAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      lastAccess: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
    },
    {
      tableName: 'users',
      modelName: 'users',
      sequelize,
    },
  );

  return UserModel;
}
