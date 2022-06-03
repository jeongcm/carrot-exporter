import { IRole } from '@/common/interfaces/role.interface';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type RoleCreationAttributes = Optional<
  IRole,
  'roleKey' | 'roleId' | 'roleName' | 'roleCode' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'customerAccountKey'
>;

export class RoleModel extends Model<IRole, RoleCreationAttributes> implements IRole {
  public roleKey: number;
  public roleId: string;
  public roleName: string;
  public roleCode: 'AD' | 'ME' | 'AM';
  public customerAccountKey: number;
  public createdBy: string;
  public updatedBy: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof RoleModel {
  RoleModel.init(
    {
      roleKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.STRING(16),
        primaryKey: false,
        allowNull: false,
        unique: true,
      },
      roleName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      roleCode: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      customerAccountKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      modelName: 'Role',
      tableName: 'Role',
      sequelize,
    },
  );

  return RoleModel;
}
