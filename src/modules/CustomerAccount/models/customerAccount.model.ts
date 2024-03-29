import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { customerAccountType, ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

export type CustomerAccountCreationAttributes = Optional<
  ICustomerAccount,
  | 'customerAccountKey'
  | 'customerAccountId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'customerAccountName'
  | 'customerAccountDescription'
  | 'parentCustomerAccountId'
  | 'customerAccountType'
  | 'customerAccountApiKey'
  | 'customerAccountApiKeyIssuedAt'
  | 'externalBillingCustomerId'
>;

export class CustomerAccountModel extends Model<ICustomerAccount, CustomerAccountCreationAttributes> implements ICustomerAccount {
  public customerAccountKey: number;
  public customerAccountId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public externalBillingCustomerId: string;

  public customerAccountName: string;
  public customerAccountDescription: string;
  public parentCustomerAccountId: string;
  public customerAccountType: customerAccountType;
  public customerAccountApiKey: string;
  public customerAccountApiKeyIssuedAt: Date;
  public updatedAt: Date;

  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof CustomerAccountModel {
  CustomerAccountModel.init(
    {
      customerAccountKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerAccountId: {
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
      customerAccountApiKeyIssuedAt: {
        type: DataTypes.DATE,
      },
      customerAccountName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      externalBillingCustomerId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      customerAccountDescription: {
        type: DataTypes.STRING(500),
      },
      customerAccountApiKey: {
        type: DataTypes.STRING(100),
      },
      parentCustomerAccountId: {
        type: DataTypes.STRING(16),
      },
      customerAccountType: {
        type: DataTypes.STRING(2),
      },
    },
    {
      tableName: 'CustomerAccount',
      modelName: 'CustomerAccount',
      sequelize,
    },
  );

  return CustomerAccountModel;
}
