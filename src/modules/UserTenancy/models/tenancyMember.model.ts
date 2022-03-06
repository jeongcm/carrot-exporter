import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { TenancyMember } from '@/common/interfaces/tenancyMember.interface';
import { UserModel } from './users.model';

export type TenancyMemberCreationAttributes = Optional<
  TenancyMember,
  | 'id'
  | 'userId'
  | 'tenancyId'
  | 'createdAt'
  | 'updatedAt'
  | 'isActivated'
  | 'isDeleted'
  | 'tenancyLastAccess'
  | 'invitedBy'
  | 'userName'
  | 'userRole'
  | 'verificationCode'
>;

export class TenancyMemberModel extends Model<TenancyMember> implements TenancyMember {
  public id: number;
  public uuid: string;
  public userName: string;
  public userId: number;
  public userRole: 'owner' | 'member' | 'maintainer';
  public verificationCode: string;
  public tenancyLastAccess: Date;
  public tenancyId: number;
  public isDeleted: boolean;
  public isActivated: boolean;
  public invitedBy: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof TenancyMemberModel {
  TenancyMemberModel.init(
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
      userId: {
        allowNull: false,
        type: DataTypes.BIGINT,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      userName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      userRole: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      verificationCode: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      tenancyId: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      tenancyLastAccess: {
        allowNull: true,
        defaultValue: new Date(),
        type: DataTypes.DATE,
      },
      isDeleted: {
        allowNull: true,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      isActivated: {
        allowNull: true,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      invitedBy: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      createdAt: {
        allowNull: false,
        defaultValue: new Date(),
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: false,
        defaultValue: new Date(),
        type: DataTypes.DATE(),
      },
    },
    {
      tableName: 'tenancyMembers',
      modelName: 'tenancyMember',
      sequelize,
    },
  );
  return TenancyMemberModel;
}
