import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAnomalyMonitoringTargetResource } from '@/common/interfaces/monitoringTargetResource.interface';

export type AnomalyMonitoringTargetResourceAttributes = Optional<
  IAnomalyMonitoringTargetResource,
  | 'anomalyMonitoringTargetResourceKey'
  | 'anomalyMonitoringTargetResourceId'
  | 'anomalyMonitoringTargetKey'
  | 'resourceKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class AnomalyMonitoringTargetResourceModel
  extends Model<IAnomalyMonitoringTargetResource, AnomalyMonitoringTargetResourceAttributes>
  implements IAnomalyMonitoringTargetResource
{
  public anomalyMonitoringTargetResourceKey: number;
  public anomalyMonitoringTargetResourceId: string;
  public anomalyMonitoringTargetKey: number;
  public resourceKey: number;
  public createdBy: string;
  public updatedBy: string;
  public updatedAt: Date;
  public deletedAt: Date;

  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof AnomalyMonitoringTargetResourceModel {
  AnomalyMonitoringTargetResourceModel.init(
    {
      anomalyMonitoringTargetResourceKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      anomalyMonitoringTargetResourceId: {
        allowNull: false,
        type: DataTypes.STRING(100),
        unique: true,
      },
      anomalyMonitoringTargetKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      resourceKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'AnomalyMonitoringTargetResource',
      modelName: 'AnomalyMonitoringTargetResource',
      sequelize,
    },
  );

  return AnomalyMonitoringTargetResourceModel;
}
