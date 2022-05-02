import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IMetricReceived } from '@/common/interfaces/metricReceived.interface';

export type MetricMetaCreationAttributes = Optional<
  IMetricReceived,
  | 'metricReceivedKey'
  | 'metricReceivedId'
  | 'metricReceivedHash'  
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'metricReceivedName'
  | 'metricReceivedMetricInstance'
  | 'metricReceivedMetricJob'  
  | 'metricReceivedMetricService'
  | 'metricReceivedMetricPod'
  | 'metricReceivedMetric'
  | 'metricReceivedMetricValue'
  | 'metricReceivedMetricDatetime'
  | 'metricMetaKey'
  | 'customerAccountKey'
>;

export class MetricReceivedModel extends Model<IMetricReceived, MetricMetaCreationAttributes > implements IMetricReceived {

    public 'metricReceivedKey': number;
    public 'metricReceivedId': string;
    public 'metricReceivedHash': string;  
    public 'createdBy': string;
    public 'updatedBy': string;
    public 'deletedAt': Date;
    public 'metricReceivedName': string; 
    public 'metricReceivedMetricInstance': string;
    public 'metricReceivedMetricJob': string;  
    public 'metricReceivedMetricService': string;
    public 'metricReceivedMetricPod': string;
    public 'metricReceivedMetric': JSON;
    public 'metricReceivedMetricValue': string;
    public 'metricReceivedMetricDatetime': Date;
    public 'metricMetaKey': number;
    public 'customerAccountKey': number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

}

export default function (sequelize: Sequelize): typeof MetricReceivedModel {
    MetricReceivedModel.init(
    {
        metricReceivedKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      metricReceivedId: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      metricReceivedHash: {
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
      metricReceivedName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      metricReceivedMetricInstance: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      metricReceivedMetricJob: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      metricReceivedMetricService: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      metricReceivedMetricPod: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      metricReceivedMetric: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      metricReceivedMetricValue: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      metricReceivedMetricDatetime: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
      metricMetaKey: {
        type: DataTypes.INTEGER, 
        allowNull: false,
      },
    },

    {
      tableName: 'MetricReceived',
      modelName: 'MetricReceived',
      sequelize,
    },
  );

  return MetricReceivedModel;
}