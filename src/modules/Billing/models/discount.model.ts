import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IDiscount } from '@/common/interfaces/discount.interface';

export type DiscountCreationAttributes = Optional<
  IDiscount,
  | 'discountKey'
  | 'discountId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'discountName'
  | 'discountDescription'
  | 'discountBillingSolutionCode'
  | 'discountType'
  | 'discountValue'
  | 'discountCurrency'
  | 'discountRecurringType'
  | 'discountFrom'
  | 'discountTo'
>;

export class DiscountModel extends Model<IDiscount, DiscountCreationAttributes> implements IDiscount {
  public discountKey: number;
  public discountId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public discountName: string;
  public discountDescription: string;
  public discountBillingSolutionCode: string;
  public discountType: 'FA' | 'PC';
  public discountValue: number;
  public discountCurrency: string;
  public discountRecurringType: 'MO' | 'YR';
  public discountFrom: Date;
  public discountTo: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof DiscountModel {
  DiscountModel.init(
    {
      discountKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      discountId: {
        allowNull: false,
        type: DataTypes.STRING(16),
        unique: true,
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
      discountName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      discountDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      discountBillingSolutionCode: {
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      discountType: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['FA', 'PC']],
            msg: " discountType must be of type 'FA' or 'PC'  Where  FA ( Fixed Amount ) PC ( Percentage )",
          },
        },
      },
      discountValue: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      discountCurrency: {
        allowNull: false,
        type: DataTypes.STRING(2),
      },
      discountRecurringType: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['MO', 'YR']],
            msg: " discountRecurringType must be of type 'MO' or 'YR' Where  MO ( monthly ) YR ( yearly )",
          },
        },
      },
      discountFrom: {
        type: DataTypes.DATE,
      },
      discountTo: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'Discount',
      modelName: 'Discount',
      sequelize,
    },
  );

  return DiscountModel;
}
