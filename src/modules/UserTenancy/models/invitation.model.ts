import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Invitation } from '@/common/interfaces/invitation.interface';

export type TenancyCreationAttributes = Optional<
  Invitation,
  | 'id'
  | 'pk'
  | 'isActive'
  | 'isAccepted'
  | 'acceptedAt'
  | 'isRejected'
  | 'rejectedAt'
  | 'tenancyPk'
  | 'invitedByUserId'
  | 'token'
  | 'createdAt'
  | 'updatedAt'
>;

export class InvitationModel extends Model<Invitation> implements Invitation {
  public pk: number;
  public id: string;
  public tenancyPk: number;
  public invitedByUserId: string;
  public isActive: boolean;
  public isAccepted: boolean;
  public acceptedAt: Date;
  public isRejected: boolean;
  public rejectedAt: Date;
  public invitedTo: string;
  public token: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof InvitationModel {
  try {
    InvitationModel.init(
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
        invitedByUserId: {
          allowNull: true,
          type: DataTypes.BIGINT,
        },
        isActive: {
          allowNull: false,
          defaultValue: true,
          type: DataTypes.BOOLEAN,
        },
        isAccepted: {
          allowNull: false,
          defaultValue: false,
          type: DataTypes.BOOLEAN,
        },
        acceptedAt: {
          allowNull: true,
          type: DataTypes.DATE,
        },
        isRejected: {
          allowNull: true,
          defaultValue: false,
          type: DataTypes.BOOLEAN,
        },
        tenancyPk: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        rejectedAt: {
          allowNull: true,
          type: DataTypes.DATE,
        },
        invitedTo: {
          allowNull: false,
          type: DataTypes.STRING,
        },
        token: {
          allowNull: false,
          type: DataTypes.STRING,
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
        tableName: 'Invitations',
        sequelize,
      },
    );
  } catch (err) {
    console.log(err);
  }
  return InvitationModel;
}
