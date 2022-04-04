import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAddress } from '@/common/interfaces/address.interface';

export type AddressCreationAttributes = Optional<
  IAddress,
  | 'addressKey'
  | 'addressId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'addr1'
  | 'addr2'
  | 'city'
  | 'state'
  | 'country'
  | 'zipcode'
  | 'addressName'
>;

export class AddressModel extends Model<IAddress, AddressCreationAttributes> implements IAddress {
  public addressKey: number;
  public addressId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public addr1: string;
  public addr2: string;
  public city: string;
  public state: string;
  public country: string;
  public zipcode: string;
  public addressName: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AddressModel {
  AddressModel.init(
    {
      addressKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      addressId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      createdBy: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      addr1: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      addr2: {
        type: DataTypes.STRING(500),
      },
      city: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(500),
      },
      country: {
        type: DataTypes.STRING(500),
      },
      zipcode: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      addressName: {
        type: DataTypes.STRING(100),
      },
    },
    {
      tableName: 'Address',
      modelName: 'Address',
      sequelize,
    },
  );

  return AddressModel;
}
