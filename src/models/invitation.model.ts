import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Invitation } from '@interfaces/invitation.interface';

export type TenancyCreationAttributes = Optional<
  Invitation,
  'isActive' | 'isAccepted' | 'acceptedAt' | 'isRejected' | 'rejectedAt' | 'tenancyId' | 'invitedByUserId' | 'token' | 'createdAt' | 'updatedAt'
>;

export class InvitationModel extends Model<Invitation> implements Invitation {
  public id: number;
  public uuid: string;
  public tenancyId: number;
  public invitedByUserId: number;
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
        tenancyId: {
          allowNull: false,
          type: DataTypes.UUID,
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
