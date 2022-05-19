import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ICoupon } from '@/common/interfaces/coupon.interface';

export type CouponCreationAttributes = Optional<
  ICoupon,
  | 'couponKey'
  | 'discountKey'
  | 'couponId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'couponFrom'
  | 'couponTo'
  | 'couponCode'
  | 'couponName'
>;

export class CouponModel extends Model<ICoupon, CouponCreationAttributes> implements ICoupon {
  public couponKey: number;
  public discountKey: number;
  public couponId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public couponFrom: Date;
  public couponTo: Date;
  public couponCode: string;
  public couponName: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof CouponModel {
  CouponModel.init(
    {
      couponKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      discountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      couponId: {
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
      couponFrom: {
        type: DataTypes.DATE,
      },
      couponTo: {
        type: DataTypes.DATE,
      },
      couponName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      couponCode: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
    },
    {
      tableName: 'Coupon',
      modelName: 'Coupon',
      sequelize,
    },
  );

  return CouponModel;
}
