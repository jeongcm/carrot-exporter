import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import {ICatalogPlan } from '@/common/interfaces/productCatalog.interface';
import { DATE } from 'sequelize';

export type CatalogPlanCreationAttributes = Optional<
    ICatalogPlan,
    'catalogPlanId'
    |'catalogPlanKey'
    |'catalogPlanName'
    |'deletedAt'
    |'catalogPlanDescription'
    |'createdAt'
    |'updatedAt'
    |'createdBy'
    |'updatedBy'
>;

export class CatalogPlanModel extends Model<ICatalogPlan, CatalogPlanCreationAttributes> implements ICatalogPlan {
    public catalogPlanId: string;
    public catalogPlanKey: number;
    public catalogPlanName: string;
    public catalogPlanDescription: string;
    public createdBy: string;
    public updatedBy: string;
    public deletedAt: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof CatalogPlanModel {
  CatalogPlanModel.init(
    {
    catalogPlanKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      catalogPlanId: {
        primaryKey: false,
        allowNull: false,
        type: DataTypes.STRING(16),
        unique:true
      },
      catalogPlanName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      catalogPlanDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
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
        type: DataTypes.STRING(45)
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
      tableName: 'CatalogPlan',
      modelName: 'CatalogPlan',
      sequelize,
    },
  );

  return CatalogPlanModel;
}
