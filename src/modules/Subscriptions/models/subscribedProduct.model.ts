import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ICatalogPlanProduct } from '@/common/interfaces/productCatalog.interface';

export type CatalogPlanProductPriceCreationAttributes = Optional<
    ICatalogPlanProduct,
    'catalogPlanProductKey'
    |'catalogPlanProductId'
    |'catalogPlanKey'
    |'createdAt'
    |'updatedAt'
    |'createdBy'
    |'updatedBy'
    |'isDeleted'
    |'catalogPlanProductName'
    |'catalogPlanProductDescription'
    |'catalogPlanProductMonthlyPrice'
    |'catalogPlanProductUOM'
    |'catalogPlanProductCurrency'
>;

export class CatalogPlanProductModel extends Model<ICatalogPlanProduct, CatalogPlanProductPriceCreationAttributes> implements ICatalogPlanProduct {
    public catalogPlanProductKey:number;
    public catalogPlanProductId:string
    public catalogPlanKey:number;
    public catalogPlanProductName:string
    public catalogPlanProductDescription:string
    public catalogPlanProductMonthlyPrice:number
    public catalogPlanProductUOM:string
    public catalogPlanProductCurrency:string
    public isDeleted: boolean;
    public createdBy: string;
    public updatedBy: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof CatalogPlanProductModel {
    CatalogPlanProductModel.init(
        {
            catalogPlanProductKey: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            catalogPlanProductId: {
                primaryKey: false,
                allowNull: false,
                type: DataTypes.STRING(16)
            },
            catalogPlanKey: {
                allowNull: false,
                type: DataTypes.INTEGER
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
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE(),
            },
            isDeleted: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue:false
            },
        },
        { 
            indexes: [
                {
                  unique: true,
                  fields: ['catalog_plan_product_id'],
                }
              ],
            tableName: 'CatalogPlanProduct',
            modelName: 'CatalogPlanProduct',
            sequelize,
        },
    );

    return CatalogPlanProductModel;
}
