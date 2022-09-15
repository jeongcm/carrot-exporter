import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ICatalogPlanProduct } from '@/common/interfaces/productCatalog.interface';

export type CatalogPlanProductCreationAttributes = Optional<
  ICatalogPlanProduct,
  | 'catalogPlanProductKey'
  | 'catalogPlanProductId'
  | 'catalogPlanKey'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'deletedAt'
  | 'catalogPlanProductName'
  | 'catalogPlanProductDescription'
  | 'catalogPlanProductMonthlyPrice'
  | 'catalogPlanProductUOM'
  | 'catalogPlanProductCurrency'
  | 'catalogPlanProductType'
  | 'billingProductId'
>;

export class CatalogPlanProductModel extends Model<ICatalogPlanProduct, CatalogPlanProductCreationAttributes> implements ICatalogPlanProduct {
  public catalogPlanProductKey: number;
  public catalogPlanProductId: string;
  public catalogPlanKey: number;
  public catalogPlanProductType: string;
  public catalogPlanProductName: string;
  public catalogPlanProductDescription: string;
  public catalogPlanProductMonthlyPrice: number;
  public catalogPlanProductUOM: string;
  public catalogPlanProductCurrency: string;
  public billingProductId: number;
  public deletedAt: Date;
  public createdBy: string;
  public updatedBy: string;
  public updatedAt: Date;

  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof CatalogPlanProductModel {
  CatalogPlanProductModel.init(
    {
      catalogPlanProductKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      catalogPlanProductId: {
        primaryKey: false,
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      catalogPlanKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      catalogPlanProductName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      catalogPlanProductDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      catalogPlanProductMonthlyPrice: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      catalogPlanProductUOM: {
        allowNull: false,
        type: DataTypes.STRING(2),
      },
      catalogPlanProductCurrency: {
        allowNull: false,
        type: DataTypes.STRING(2),
      },
      catalogPlanProductType: {
        allowNull: false,
        type: DataTypes.STRING(2),
      },
      billingProductId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['catalog_plan_product_id'],
        },
      ],
      tableName: 'CatalogPlanProduct',
      modelName: 'CatalogPlanProduct',
      sequelize,
    },
  );

  return CatalogPlanProductModel;
}
