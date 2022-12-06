import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ICatalogPlan } from '@/common/interfaces/productCatalog.interface';
import { DATE } from 'sequelize';

export type CatalogPlanCreationAttributes = Optional<
  ICatalogPlan,
  | 'catalogPlanId'
  | 'catalogPlanKey'
  | 'catalogPlanName'
  | 'catalogPlanType'
  | 'deletedAt'
  | 'catalogPlanDescription'
  | 'billingPlanFrequencyId'
  | 'billingPlanId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
>;

export class CatalogPlanModel extends Model<ICatalogPlan, CatalogPlanCreationAttributes> implements ICatalogPlan {
  public catalogPlanId: string;
  public catalogPlanKey: number;
  public catalogPlanName: string;
  public catalogPlanType: string;
  public catalogPlanDescription: string;
  public billingPlanFrequencyId: number;
  public billingPlanId: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public updatedAt: Date;

  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof CatalogPlanModel {
  CatalogPlanModel.init(
    {
      catalogPlanKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      catalogPlanId: {
        primaryKey: false,
        allowNull: false,
        type: DataTypes.STRING(100),
        unique: true,
      },
      catalogPlanName: {
        allowNull: false,
        type: DataTypes.STRING(100),
        unique: true,
      },
      catalogPlanDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      catalogPlanType: {
        allowNull: false,
        type: DataTypes.STRING(2),
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
        defaultValue: new Date(),
      },
      billingPlanId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      billingPlanFrequencyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
        defaultValue: new Date(),
      },
    },

    {
      tableName: 'CatalogPlan',
      modelName: 'CatalogPlan',
      sequelize,
    },
  );

  return CatalogPlanModel;
}
