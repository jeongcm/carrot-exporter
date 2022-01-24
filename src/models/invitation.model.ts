import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Invitation } from '@interfaces/invitation.interface';
import { TenancyMember } from '@interfaces/tenancyMember.interface';
import { UserModel } from './users.model';

export type TenancyCreationAttributes = Optional<Invitation, "isActive"| "isAccepted"|  "acceptedAt"| "isRejected" | "rejectedAt"| "tenancyId"| "invitedByUserId"| "token"|"createdAt"|"updatedAt"
>;

export class InvitationModel extends Model<Invitation> implements Invitation {
  public id: string;
  public isActive: boolean;
  public isAccepted: boolean;
  public acceptedAt: Date;
  public isRejected: boolean;
  public rejectedAt: Date;
  public tenancyId: string;
  public invitedTo: string;
  public invitedByUserId: string; 
  public token: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof InvitationModel {
  try{

    InvitationModel.init(
      {
        id: {
          primaryKey: true,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          type: DataTypes.UUID,
        },
        isActive: {
          allowNull: false,
          defaultValue:true,
          type: DataTypes.BOOLEAN,
        },
        isAccepted: {
          allowNull: false,
          defaultValue:false,
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
        invitedByUserId: {
          allowNull: true,
          type: DataTypes.UUID,
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
  }catch(err){
    console.log(err);
  }
   return InvitationModel;
}
