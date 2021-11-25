import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { TenancyMember } from '@interfaces/tenancyMember.interface';

export type TenancyCreationAttributes = Optional<TenancyMember, 'id' | 'userId' | 'tenancyId' >;

export class TenancyMemberModel extends Model<TenancyMember> implements TenancyMember {
  public id: string;
  public userName: string;
  public tenancyCode: string;
  public tenancyDescription: string;
  public isDeleted: boolean;
  public createdBy: string;
  public updatedBy: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof TenancyMemberModel {
  TenancyMemberModel.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      tenancyName: {
        allowNull: false,
        type: DataTypes.STRING,
        
      },
      tenancyCode: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      tenancyDescription: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      isDeleted: {
        allowNull: true,
        defaultValue:false,
        type: DataTypes.BOOLEAN,
      },
      createdBy: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      updatedBy: {
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
      }
    },
    {
      tableName: 'tenancies',
      sequelize,
    },
  );

  return TenancyMemberModel;
}
