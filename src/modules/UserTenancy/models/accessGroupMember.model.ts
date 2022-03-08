import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupMember } from '@/common/interfaces/accessGroupMember.interface';

export type AccessGroupMemberCreationAttributes = Optional<
  AccessGroupMember,
  'id' | 'accessGroupId' | 'userId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupMemberModel extends Model<AccessGroupMember, AccessGroupMemberCreationAttributes> implements AccessGroupMember {
  public id: number;
  public uuid: string;
  public accessGroupId: number;
  public userId: number;
  public createdBy: number;
  public updatedBy: number;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupMemberModel {
  AccessGroupMemberModel.init(
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
      accessGroupId: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      userId: {
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
