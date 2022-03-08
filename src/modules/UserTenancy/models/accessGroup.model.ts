import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroup } from '@/common/interfaces/accessGroup.interface';

export type AccessGroupCreationAttributes = Optional<
  AccessGroup,
  'id' | 'groupName' | 'description' | 'icon' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'tenancyId'
>;

export class AccessGroupModel extends Model<AccessGroup, AccessGroupCreationAttributes> implements AccessGroup {
  public id: number;
  public uuid: string;
  public tenancyId: number;
  public groupName: string;
  public createdBy: number;
  public updatedBy: number;
  public description: string;
  public icon: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupModel {
  AccessGroupModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      uuid: {
        primaryKey: false,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      tenancyId: {
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
    },
    {
      tableName: 'AccessGroup',
      modelName: 'AccessGroup',
      sequelize,
    },
  );

  return AccessGroupModel;
}
