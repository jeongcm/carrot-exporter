import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { TenancyMember } from '@/common/interfaces/tenancyMember.interface';
import { UserRole } from '@common/enums';

export type TenancyMemberCreationAttributes = Optional<
  TenancyMember,
  | 'id'
  | 'pk'
  | 'userPk'
  | 'tenancyPk'
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
  public pk: number;
  public id: string;
  public userName: string;
  public userPk: number;
  public userRole: UserRole;
  public verificationCode: string;
  public tenancyLastAccess: Date;
  public tenancyPk: number;
  public isDeleted: boolean;
  public isActivated: boolean;
  public invitedBy: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof TenancyMemberModel {
  TenancyMemberModel.init(
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
      userPk: {
        allowNull: false,
        type: DataTypes.BIGINT,
        references: {
          model: 'users',
          key: 'pk',
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
      tenancyPk: {
        allowNull: true,
        type: DataTypes.BIGINT,
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
        type: DataTypes.BIGINT,
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
