import { AddressModel } from '@/modules/Address/models/address.model';
import { CustomerAccountModel } from '@/modules/CustomerAccount/models/customerAccount.model';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ICustomerAccountAddress } from '@/common/interfaces/customerAccountAddress.interface';

export type CustomerAccountAddressCreationAttributes = Optional<
  ICustomerAccountAddress,
  | 'customerAccountAddressKey'
  | 'customerAccountAddressId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'customerAccountKey'
  | 'addressKey'
  | 'customerAccountAddressFrom'
  | 'customerAccountAddressTo'
>;

export class CustomerAccountAddressModel
  extends Model<ICustomerAccountAddress, CustomerAccountAddressCreationAttributes>
  implements ICustomerAccountAddress
{
  public customerAccountAddressKey: number;
  public customerAccountAddressId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public customerAccountKey: number;
  public addressKey: number;
  public customerAccountAddressFrom: Date;
  public customerAccountAddressTo: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof CustomerAccountAddressModel {
  CustomerAccountAddressModel.init(
    {
      customerAccountAddressKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerAccountAddressId: {
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
      customerAccountKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: CustomerAccountModel,
          key: 'customerAccountKey',
        },
      },
      addressKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: AddressModel,
          key: 'addressKey',
        },
      },
      customerAccountAddressFrom: {
        type: DataTypes.DATE,
      },
      customerAccountAddressTo: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'CustomerAccountAddress',
      modelName: 'CustomerAccountAddress',
      sequelize,
    },
  );

  return CustomerAccountAddressModel;
}
