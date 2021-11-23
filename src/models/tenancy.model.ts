import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Tenancy } from '@interfaces/tenancy.interface';

export type TenancyCreationAttributes = Optional<Tenancy, 'id' | 'tenancyCode' | 'tenancyName' >;

export class TenancyModel extends Model<Tenancy, TenancyCreationAttributes> implements Tenancy {
  public id: string;
  public tenancyName: string;
  public tenancyCode: string;
  public tenancyDescription: string;
  public isDeleted: boolean;
  public createdBy: string;
  public updatedBy: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof TenancyModel {
  TenancyModel.init(
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

  return TenancyModel;
}
