import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroup } from '@interfaces/accessGroup.interface';

export type AccessGroupCreationAttributes = Optional<AccessGroup, 'id' | 'groupName' | 'description' | 'icon' | 'createdAt' | 'updatedAt'>;

export class AccessGroupModel extends Model<AccessGroup, AccessGroupCreationAttributes> implements AccessGroup {
  public id: string;
  public groupName: string;
  public description: string;
  public icon: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupModel {
  AccessGroupModel.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      groupName: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      icon: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
    },
    {
      tableName: 'AccessGroup',
      sequelize,
    },
  );

  return AccessGroupModel;
}
