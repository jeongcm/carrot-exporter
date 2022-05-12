import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IBillingAccount } from '@/common/interfaces/billingAccount.interface';

export type BillingAccountAttributes = Optional<
  IBillingAccount,
  | 'billingAccountKey'
  | 'customerAccountKey'
  | 'addressKey'
  | 'billingAccountId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'billingAccountName'
  | 'billingAccountDescription'
  | 'billingAccountAutoCollect'
  | 'billingAccountNextBillDay'
  | 'billingBalance'
  | 'billingCurrency'
  | 'billingAccountTerm'
  | 'billingAccountStatus'
>;

export class BillingAccountModel extends Model<IBillingAccount, BillingAccountAttributes> implements IBillingAccount {
  public billingAccountKey: number;
  public customerAccountKey: number;
  public addressKey: number;
  public billingAccountId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public billingAccountName: string;
  public billingAccountDescription: string;
  public billingAccountAutoCollect: boolean;
  public billingAccountNextBillDay: Date;
  public billingBalance: number;
  public billingCurrency: string;
  public billingAccountTerm: '05' | '10' | '30';
  public billingAccountStatus: 'AC' | 'SP' | 'OD';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof BillingAccountModel {
  BillingAccountModel.init(
    {
      billingAccountKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      addressKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
        unique: true,
      },
      billingAccountId: {
        allowNull: false,
        type: DataTypes.STRING(16),
        unique: 'unique_index',
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
      billingAccountName: {
        type: DataTypes.STRING(100),
      },
      billingAccountDescription: {
        type: DataTypes.STRING(500),
      },
      billingAccountAutoCollect: {
        type: DataTypes.BOOLEAN,
      },
      billingAccountNextBillDay: {
        type: DataTypes.DATE,
      },
      billingBalance: {
        type: DataTypes.DOUBLE,
      },
      billingCurrency: {
        type: DataTypes.STRING(2),
      },
      billingAccountTerm: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['05', '10', '30']],
            msg: "billingAccountTerm must be of type '05' or '10' or '30'  Where  05 - NET5, 10 - NET10, 30 - NET30",
          },
        },
      },
      billingAccountStatus: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['AC', 'SP', 'OD']],
            msg: "billingAccountStatus must be of type 'AC', 'SP', 'OD' Where AC: active, SP: suspended, OD: overdue",
          },
        },
      },
    },
    {
      indexes: [
        {
          name: 'unique_index',
          unique: true,
          fields: ['billingAccountId'],
        },
      ],
      tableName: 'BillingAccount',
      modelName: 'BillingAccount',
      sequelize,
    },
  );

  return BillingAccountModel;
}
