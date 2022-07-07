import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IExporters } from '@/common/interfaces/exporters.interface';

export type ExporterCreationAttributes = Optional<
  IExporters,
  | 'exporterKey'
  | 'exporterId'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'exporterName'
  | 'exporterDescription'
  | 'exporterHelmChartName'
  | 'exporterHelmChartRepoUrl'  
  | 'exporterHelmChartVersion'
  | 'exporterHelmChartValues'
  | 'grafanaDashboard'
>;

export class ExportersModel extends Model<IExporters, ExporterCreationAttributes> implements IExporters {
  public exporterKey: number;
  public exporterId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public exporterName: string;
  public exporterDescription: string;
  public exporterHelmChartRepoUrl: string;
  public exporterHelmChartName: string;
  public exporterHelmChartVersion: string;
  public exporterHelmChartValues: JSON;
  public grafanaDashboard: JSON;
  public updatedAt: Date;

  public readonly createdAt!: Date;
  
}

export default function (sequelize: Sequelize): typeof ExportersModel {
  ExportersModel.init(
    {
      exporterKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      exporterId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      createdBy: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      exporterName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      exporterDescription: {
        type: DataTypes.STRING(500),
      },
      exporterHelmChartName: {
        type: DataTypes.STRING(100),
      },
      exporterHelmChartRepoUrl: {
        type: DataTypes.STRING(500),
      },
      exporterHelmChartVersion: {
        type: DataTypes.STRING(100),
      },
      exporterHelmChartValues: {
        type: DataTypes.JSON,
      },
      grafanaDashboard: {
        type: DataTypes.JSON,
      },
    },
    {
      tableName: 'Exporters',
      modelName: 'Exporters',
      sequelize,
    },
  );

  return ExportersModel;
}
