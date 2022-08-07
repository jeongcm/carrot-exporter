import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IChart } from 'common/interfaces/chart.interface';

export type ChartCreationAttributes = Optional<
  IChart,
  | 'chartKey'
  | 'chartId'
  | 'customerAccountKey'
  | 'resourceGroupKey'
  | 'resourceKey'
  | 'configJson'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class ChartModel extends Model<IChart, ChartCreationAttributes> implements IChart {
  public chartKey: number;
  public chartId: string;
  public customerAccountKey: number;
  public resourceGroupKey: number;
  public resourceKey: number;
  public configJson: string;

  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ChartModel {
  ChartModel.init(
    {
      chartKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      chartId: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      configJson: {
        allowNull: false,
        type: DataTypes.TEXT('long'),
      },
      resourceGroupKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      resourceKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.STRING(16),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE(),
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
    },

    {
      tableName: 'Chart',
      modelName: 'Chart',
      sequelize,
      deletedAt: 'deletedAt',
      paranoid: true,
    },
  );

  return ChartModel;
}
