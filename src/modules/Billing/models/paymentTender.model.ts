import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IPaymentTender } from '@/common/interfaces/paymentTender.interface';

export type PaymentTenderAttributes = Optional<
  IPaymentTender,
  | 'paymentTenderKey'
  | 'billingAccountKey'
  | 'paymentTenderId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'paymentTenderDefault'
  | 'paymentTenderDetails1'
  | 'paymentTenderDetails2'
  | 'paymentTenderDetails3'
  | 'paymentTenderDetails4'
  | 'isValidated'
  | 'validatedAt'
  | 'paymentTenderType'
>;

export class PaymentTenderModel extends Model<IPaymentTender, PaymentTenderAttributes> implements IPaymentTender {
  public paymentTenderKey: number;
  public billingAccountKey: number;
  public paymentTenderId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public paymentTenderDefault: boolean;
  public paymentTenderDetails1: string;
  public paymentTenderDetails2: string;
  public paymentTenderDetails3: string;
  public paymentTenderDetails4: string;
  public isValidated: boolean;
  public validatedAt: Date;
  public paymentTenderType: 'VI' | 'MS' | 'AM' | 'PP';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof PaymentTenderModel {
  PaymentTenderModel.init(
    {
      paymentTenderKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      billingAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      paymentTenderId: {
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
      paymentTenderDefault: {
        type: DataTypes.BOOLEAN,
      },
      paymentTenderDetails1: {
        type: DataTypes.STRING(50),
      },
      paymentTenderDetails2: {
        type: DataTypes.STRING(50),
      },
      paymentTenderDetails3: {
        type: DataTypes.STRING(50),
      },
      paymentTenderDetails4: {
        type: DataTypes.STRING(50),
      },
      isValidated: {
        type: DataTypes.BOOLEAN,
      },
      validatedAt: {
        type: DataTypes.DATE,
      },
      paymentTenderType: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['VI', 'MS', 'AM', 'PP']],
            msg: 'payment tender type: VI (via), MS (master), AM (amex),  PP (paypal)',
          },
        },
      },
    },
    {
      tableName: 'PaymentTender',
      modelName: 'PaymentTender',
      sequelize,
    },
  );

  return PaymentTenderModel;
}
