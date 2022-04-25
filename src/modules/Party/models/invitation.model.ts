import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IInvitation } from '@/common/interfaces/invitation.interface';

export type InvitationCreationAttributes = Optional<
  IInvitation,
  | 'invitationKey'
  | 'invitationId'
  | 'customerAccountKey'
  | 'messageKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'invitedByPartyKey'
  | 'isActive'
  | 'isAccepted'
  | 'acceptedAt'
  | 'isRejected'
  | 'rejectedAt'
  | 'invitedTo'
  | 'token'
  | 'customMsg'
>;

export class InvitationModel extends Model<IInvitation, InvitationCreationAttributes> implements IInvitation {
  public invitationKey: number;
  public invitationId: string;
  public customerAccountKey: number;
  public messageKey: number;
  public createdBy: string;
  public updatedBy: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  public invitedByPartyKey: number;
  public isActive: boolean;
  public isAccepted: boolean;
  public acceptedAt: Date;
  public isRejected: boolean;
  public rejectedAt: Date;
  public invitedTo: string;
  public token: string;
  public customMsg: string;
}

export default function (sequelize: Sequelize): typeof InvitationModel {
  InvitationModel.init(
    {
      invitationKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      invitationId: {
        allowNull: false,
        type: DataTypes.STRING(16),
        unique: true,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      messageKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      invitedByPartyKey: {
        type: DataTypes.INTEGER,
      },
      isActive: {
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
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      rejectedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      invitedTo: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      token: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      customMsg: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'Invitation',
      modelName: 'Invitation',
      sequelize,
    },
  );

  return InvitationModel;
}
