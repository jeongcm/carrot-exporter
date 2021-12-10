import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupMember } from '@interfaces/accessGroupMember.interface';

export type AccessGroupMemberCreationAttributes = Optional<
  AccessGroupMember,
  'id' | 'groupId' | 'memberId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupMemberModel extends Model<AccessGroupMember, AccessGroupMemberCreationAttributes> implements AccessGroupMember {
  public id: string;
  public groupId: string;
  public memberId: string;
  public createdBy: string;
  public updatedBy: string;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupMemberModel {
  AccessGroupMemberModel.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      groupId: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      memberId: {
        allowNull: false,
        type: DataTypes.STRING(45),
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
      sequelize,
    },
  );

  return AccessGroupMemberModel;
}
