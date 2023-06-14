import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ITbCustomer } from '@/common/interfaces/tbCustomer.interface';

export type TbCustomerCreationAttributes = Optional<
  ITbCustomer,
  | 'customerUuid'
  | 'customerName'
  | 'contractStartDate'
  | 'contractEndDate'
  | 'businessRegistrationNumber'
  | 'representativeName'
  | 'representativeTel'
  | 'representativeEmail'
  | 'zipCode'
  | 'address'
  | 'addressDetail'
  | 'description'
  | 'ncCustomerAccountKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class TbCustomerModel extends Model<ITbCustomer, TbCustomerCreationAttributes> implements ITbCustomer {
  public customerUuid: string;
  public customerName: string;
  public contractStartDate: Date;
  public contractEndDate: Date;
  public businessRegistrationNumber: string;
  public representativeName: string;
  public representativeTel: string;
  public representativeEmail: string;
  public zipCode: string;
  public address: string;
  public addressDetail: string;
  public description: string;
  public ncCustomerAccountKey: string;
  public createdBy: string;
  public updatedBy: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
}

export default function (sequelize: Sequelize): typeof TbCustomerModel {
  TbCustomerModel.init(
    {
      customerUuid: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
      },
      customerName: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      contractStartDate: {
        type: DataTypes.DATE,
      },
      contractEndDate: {
        type: DataTypes.DATE,
      },
      businessRegistrationNumber: {
        type: DataTypes.STRING(10),
      },
      representativeName: {
        type: DataTypes.STRING(100),
      },
      representativeTel: {
        type: DataTypes.STRING(11),
      },
      representativeEmail: {
        type: DataTypes.STRING(200),
      },
      zipCode: {
        type: DataTypes.STRING(5),
      },
      address: {
        type: DataTypes.STRING(200),
      },
      addressDetail: {
        type: DataTypes.STRING(200),
      },
      description: {
        type: DataTypes.STRING(2000),
      },
      ncCustomerAccountKey: {
        type: DataTypes.INTEGER,
      },
      createdBy: {
        type: DataTypes.STRING(36),
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedBy: {
        type: DataTypes.STRING(36),
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'TB_CUSTOMER',
      modelName: 'TB_CUSTOMER',
      sequelize,
    },
  );

  return TbCustomerModel;
}
