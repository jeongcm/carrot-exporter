import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Tenancy } from '@/common/interfaces/tenancy.interface';
import { TenancyMember } from '@/common/interfaces/tenancyMember.interface';
import { UserModel } from './users.model';

export type TenancyCreationAttributes = Optional<Tenancy, 'id' | 'tenancyCode' | 'tenancyName'>;

export class TenancyModel extends Model<Tenancy> implements Tenancy {
  public id: number;
  public uuid: string;
  public tenancyName: string;
  public tenancyCode: string;
  public tenancyDescription: string;
  public isDeleted: boolean;
  public createdBy: number;
  public updatedBy: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof TenancyModel {
  TenancyModel.init(
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
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      createdBy: {
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      updatedBy: {
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
      tableName: 'tenancies',
      sequelize,
    },
  );
   return TenancyModel;
}
