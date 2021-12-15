import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { User } from '@interfaces/users.interface';
import { TenancyMemberModel } from './tenancyMember.model';
import { TenancyModel } from './tenancy.model';

export type UserCreationAttributes = Optional<
  User,
  'id' | 'email' | 'password' | 'username' | 'firstName' | 'lastAccess' | 'lastName' | 'mobile' | 'photo' | 'createdAt' | 'updatedAt'
>;

export class UserModel extends Model<User, UserCreationAttributes> implements User {
  public id: string;
  public email: string;
  public password: string;
  public username: string;
  public firstName: string;
  public lastName: string;
  public mobile: string;
  public photo: string;
  public currentTenancy:string;
  public isEmailValidated:boolean;
  public emailValidatedOn:Date;
  public token:string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly lastAccess!: Date;
}

export default function (sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
        // references:{
        //   model:TenancyMemberModel,
        //   key:"userId"
        // }
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
        type: DataTypes.STRING(45),
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      isEmailValidated: {
        allowNull: true,
        type: DataTypes.BOOLEAN,
        defaultValue:false
      },
      emailValidatedOn: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      token: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      currentTenancy: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      lastAccess: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
    },
    {
      tableName: 'user',
      modelName: 'user',
      sequelize,
    },
  );

  // TenancyMemberModel.hasMany(UserModel, {as:'users', foreignKey: 'id'});
  // UserModel.belongsTo(TenancyMemberModel, {as:'tenancyMembers', foreignKey: 'userId'});

  return UserModel;
}
