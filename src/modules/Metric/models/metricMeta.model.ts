import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IMetricMeta } from '@/common/interfaces/metricMeta.interface';

export type MetricMetaCreationAttributes = Optional<
  IMetricMeta,
  | 'metricMetaKey'
  | 'metricMetaId'
  | 'metricMetaHash'  
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'metricMetaName'
  | 'metricMetaDescription'
  | 'metricMetaType'  
  | 'metricMetaUnit'
  | 'metricMetaTargetInstance'
  | 'metricMetaTargetJob'
  | 'metricMetaTargetService'
  | 'metricMetaTargetPod'
  | 'metricMetaTarget'
  | 'customerAccountKey'
  | 'resourceKey'  
  | 'resourceGroupUuid'
  | 'metricMetaTargetMetricsPath'
>;

export class MetricMetaModel extends Model<IMetricMeta, MetricMetaCreationAttributes > implements IMetricMeta {

  public metricMetaKey: number;
  public metricMetaId: string;
  public metricMetaHash: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public metricMetaName: string;
  public metricMetaDescription: string;
  public metricMetaType: string;
  public metricMetaUnit: string;
  public metricMetaTargetInstance: string;
  public metricMetaTargetJob: string;
  public metricMetaTargetService: string;
  public metricMetaTargetPod: string;
  public metricMetaTarget: JSON;
  public customerAccountKey: number;
  public resourceKey: number;
  public resourceGroupUuid: string;
  public metricMetaTargetMetricsPath: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

}

export default function (sequelize: Sequelize): typeof MetricMetaModel {
    MetricMetaModel.init(
    {
      metricMetaKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      metricMetaId: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      metricMetaHash: {
        allowNull: false,
        type: DataTypes.STRING(40),
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
      metricMetaName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      metricMetaDescription: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      metricMetaType: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      metricMetaUnit: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      metricMetaTargetInstance: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      metricMetaTargetJob: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      metricMetaTargetService: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      metricMetaTargetPod: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      metricMetaTarget: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      resourceKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      metricMetaTargetMetricsPath: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      resourceGroupUuid: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
          },

    {
      tableName: 'MetricMeta',
      modelName: 'MetricMeta',
      sequelize,
    },
  );

  return MetricMetaModel;
}