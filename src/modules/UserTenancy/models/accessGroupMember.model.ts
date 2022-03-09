import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupMember } from '@/common/interfaces/accessGroupMember.interface';

export type AccessGroupMemberCreationAttributes = Optional<
  AccessGroupMember,
  'id' | 'pk' | 'accessGroupPk' | 'userPk' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupMemberModel extends Model<AccessGroupMember, AccessGroupMemberCreationAttributes> implements AccessGroupMember {
  public pk: number;
  public id: string;
  public accessGroupPk: number;
  public userPk: number;
  public createdBy: number;
  public updatedBy: number;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupMemberModel {
  AccessGroupMemberModel.init(
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
      accessGroupPk: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      userPk: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      updatedBy: {
        allowNull: false,
        type: DataTypes.UUID,
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
      tableName: 'AccessGroupMember',
      modelName: 'AccessGroupMember',
      sequelize,
    },
  );

  return AccessGroupMemberModel;
}
