import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import {ICatalogPlanProductPrice } from '@/common/interfaces/productCatalog.interface';

export type CatalogPlanProductPricingCreationAttributes = Optional<
    ICatalogPlanProductPrice,
    "catalogPlanProductKey"
    |"catalogPlanProductPricingId"
    |"createdAt"
    |"updatedAt"
    |"createdBy"
    |"updatedBy"
    |"catalogPlanProductMonthlyPriceFrom"
    |"catalogPlanProductMonthlyPriceTo"
    |"catalogPlanProductMonthlyPrice"
>;

export class CatalogPlanProductPriceModel extends Model<ICatalogPlanProductPrice, CatalogPlanProductPricingCreationAttributes> implements ICatalogPlanProductPrice {
    public catalogPlanProductKey:number;
    public catalogPlanProductPricingId:string;
    public catalogPlanProductMonthlyPriceFrom:Date;
    public catalogPlanProductMonthlyPriceTo:Date;
    public catalogPlanProductMonthlyPrice:number
    public catalogPlanProductPriceKey :number
    public isDeleted: Date;
    public createdBy: string;
    public updatedBy: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof CatalogPlanProductPriceModel {
  CatalogPlanProductPriceModel.init(
    {
        catalogPlanProductPriceKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      catalogPlanProductPricingId: {
        primaryKey: false,
        allowNull: false,
        type: DataTypes.STRING(16),
        unique:true
      },
      catalogPlanProductKey:{
        allowNull: false,
        type: DataTypes.INTEGER
      },
      catalogPlanProductMonthlyPriceFrom: {
        allowNull: false,
        type: DataTypes.DATE
      },
      catalogPlanProductMonthlyPriceTo: {
        allowNull: false,
        type: DataTypes.DATE
      },
      catalogPlanProductMonthlyPrice:{
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
        defaultValue:'system'
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(16),
        defaultValue:'system'
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
        defaultValue:new Date()
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
        defaultValue:new Date()
      },
      isDeleted: {
        allowNull: true,
        type: DataTypes.DATE()
      },
    },
    {
      tableName: 'CatalogPlanProductPrice',
      modelName: 'CatalogPlanProductPrice',
      sequelize,
    },
  );

  return CatalogPlanProductPriceModel;
}
