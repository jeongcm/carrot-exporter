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

export class CatalogPlanProductModel extends Model<ICatalogPlanProduct, CatalogPlanProductCreationAttributes> implements ICatalogPlanProduct {
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
                defaultValue: DataTypes.UUIDV4,
                type: DataTypes.UUID
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
                allowNull: true,
                type: DataTypes.STRING(16),
                defaultValue:'system'
            },
            updatedBy: {
                allowNull: true,
                type: DataTypes.STRING(45),
                defaultValue:'system'
            },
            createdAt: {
                allowNull: true,
                type: DataTypes.DATE(),
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE(),
            },
            isDeleted: {
                allowNull: true,
                type: DataTypes.BOOLEAN,
                defaultValue:false
            },
        },
        {
            tableName: 'catalogPlanProducts',
            modelName: 'catalogPlanProducts',
            sequelize,
        },
    );

    return CatalogPlanProductModel;
}
