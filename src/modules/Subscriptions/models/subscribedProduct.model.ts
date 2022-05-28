import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ISubscribedProduct } from '@/common/interfaces/subscription.interface';
import { DATE } from 'sequelize';

export type subscribedProductCreationAttributes = Optional<
    ISubscribedProduct,
    | "subscribedProductKey"
    | "subscriptionKey"
    | "catalogPlanProductKey"
    | "resourceKey"
    | "subscribedProductId"
    | "createdAt"
    | "updatedAt"
    | "createdBy"
    | "updatedBy"
    | "deletedAt"
    | "subscribedProductFrom"
    | "subscribedProductTo"
    | "subscribedProductStatus"
>;

export class SubscribedProductModel extends Model<ISubscribedProduct, subscribedProductCreationAttributes> implements ISubscribedProduct {
    public subscribedProductKey: number;
    public subscribedProductId: string;
    public subscriptionKey: number;
    public catalogPlanProductKey: number;
    public resourceKey: number;
    public createdBy: string;
    public updatedBy: string;
    public deletedAt: Date;
    public subscribedProductFrom: Date;
    public subscribedProductTo: Date;
    public subscribedProductStatus: string;
    public updatedAt: Date;

    public readonly createdAt!: Date;
    
}

export default function (sequelize: Sequelize): typeof SubscribedProductModel {
    SubscribedProductModel.init(
        {
            subscribedProductKey: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            subscribedProductId: {
                primaryKey: false,
                allowNull: false,
                type: DataTypes.STRING(16)
            },
            subscriptionKey: {
                allowNull: true,
                type: DataTypes.INTEGER,
            },
            catalogPlanProductKey: {
                allowNull: true,
                type: DataTypes.INTEGER,
            },
            resourceKey: {
                allowNull: true,
                type: DataTypes.INTEGER,
            },
            subscribedProductFrom: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            subscribedProductTo: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            subscribedProductStatus: {
                allowNull: false,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'SP', 'TM']],
                        msg: " subscriptionStatus must be of type  ['AC' |'SP' | 'TM'] AC: Active| 계약중, SP: Suspended| 일시정지, TM: Terminated, 해지"
                    }
                }
            },
         
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE()
            },
            createdBy: {
                allowNull: false,
                type: DataTypes.STRING(16)
            },
            updatedBy: {
                allowNull: true,
                type: DataTypes.STRING(16)
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE(),
                defaultValue: new Date()
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE(),
                defaultValue: new Date()
            },
        },

        {

            tableName: 'SubscribedProduct',
            modelName: 'SubscribedProduct',
            indexes: [
                {
                    unique: true,
                    fields: ['subscribed_product_id'],
                }
            ],
            sequelize,
        },
    );

    return SubscribedProductModel;
}
