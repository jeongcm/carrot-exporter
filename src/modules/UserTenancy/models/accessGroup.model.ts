import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroup } from '@/common/interfaces/accessGroup.interface';

export type AccessGroupCreationAttributes = Optional<
  AccessGroup,
  'id' | 'pk' | 'groupName' | 'description' | 'icon' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'tenancyPk'
>;

export class AccessGroupModel extends Model<AccessGroup, AccessGroupCreationAttributes> implements AccessGroup {
  public pk: number;
  public id: string;
  public tenancyPk: number;
  public groupName: string;
  public createdBy: number;
  public updatedBy: number;
  public description: string;
  public icon: string;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupModel {
  AccessGroupModel.init(
    {
      pk: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      id: {
        primaryKey: false,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      tenancyPk: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      updatedBy: {
        allowNull: false,
        type: DataTypes.STRING(45),
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
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'AccessGroup',
      modelName: 'AccessGroup',
      sequelize,
    },
  );

  return AccessGroupModel;
}
