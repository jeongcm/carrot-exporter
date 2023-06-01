import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ITbCustomerAccountCloudPlatform } from '@/common/interfaces/tbCustomerAccountCloudPlatform.interface';

export type TbCustomerAccountCloudPlatformCreationAttributes = Optional<
  ITbCustomerAccountCloudPlatform,
  | 'cloudPlatformUuid'
  | 'customerUuid'
  | 'accountUuid'
  | 'cloudPlatformName'
  | 'cloudPlatformTypeCode'
  | 'regionCode'
  | 'ncResourceGroupKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class tbCustomerAccountCloudPlatformModel
  extends Model<ITbCustomerAccountCloudPlatform, TbCustomerAccountCloudPlatformCreationAttributes>
  implements ITbCustomerAccountCloudPlatform
{
  public cloudPlatformUuid: string;
  public customerUuid: string;
  public accountUuid: string;
  public cloudPlatformName: string;
  public cloudPlatformTypeCode: string;
  public regionCode: string;
  public ncResourceGroupKey: string;
  public createdBy: string;
  public updatedBy: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
}

export default function (sequelize: Sequelize): typeof tbCustomerAccountCloudPlatformModel {
  tbCustomerAccountCloudPlatformModel.init(
    {
      cloudPlatformUuid: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
      },
      customerUuid: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      accountUuid: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      cloudPlatformName: {
        type: DataTypes.STRING(100),
      },
      cloudPlatformTypeCode: {
        type: DataTypes.STRING(3),
      },
      regionCode: {
        type: DataTypes.STRING(5),
      },
      ncResourceGroupKey: {
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
      tableName: 'TB_CUSTOMER_ACCOUNT_CLOUD_PLATFORM',
      modelName: 'TB_CUSTOMER_ACCOUNT_CLOUD_PLATFORM',
      sequelize,
    },
  );

  return tbCustomerAccountCloudPlatformModel;
}
