import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IBillingAccountDiscount } from '@/common/interfaces/billingAccountDiscount.interface';

export type BillingAccountDiscountAttributes = Optional<
  IBillingAccountDiscount,
  | 'billingAccountDiscountKey'
  | 'billingAccountKey'
  | 'discountKey'
  | 'billingAccountDiscountId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'billingAccountDiscountFrom'
  | 'billingAccountDiscountTo'
>;

export class BillingAccountDiscountModel extends Model<IBillingAccountDiscount, BillingAccountDiscountAttributes> implements IBillingAccountDiscount {
  public billingAccountDiscountKey: number;
  public billingAccountKey: number;
  public discountKey: number;
  public billingAccountDiscountId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public billingAccountDiscountFrom: Date;
  public billingAccountDiscountTo: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof BillingAccountDiscountModel {
  BillingAccountDiscountModel.init(
    {
      billingAccountDiscountKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      billingAccountKey: {
        type: DataTypes.INTEGER,
      },
      discountKey: {
        type: DataTypes.INTEGER,
      },
      billingAccountDiscountId: {
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
      billingAccountDiscountFrom: {
        type: DataTypes.DATE,
      },
      billingAccountDiscountTo: {
        type: DataTypes.DATE,
      },
    },
    {
      indexes: [
        {
          name: 'unique_index',
          unique: true,
          fields: ['billingAccountDiscountId'],
        },
      ],
      tableName: 'BillingAccountDiscount',
      modelName: 'BillingAccountDiscount',
      sequelize,
    },
  );

  return BillingAccountDiscountModel;
}
