import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { User } from '@interfaces/users.interface';

export type UserCreationAttributes = Optional<User, 'id' | 'email' | 'password' | 'name'>;

export class UserModel extends Model<User, UserCreationAttributes> implements User {
  public id: number;
  public email: string;
  public password: string;
  public name: string;
  public firstName: string;
  public lastName: string;
  public mobile: string;
  public photo: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly lastAccess!: Date;
}

export default function (sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER(),
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING(45),
        
      },
      name: {
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
      sequelize,
    },
  );

  return UserModel;
}
