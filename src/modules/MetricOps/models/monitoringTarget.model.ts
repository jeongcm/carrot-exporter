import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IBayesianModel } from '@/common/interfaces/bayesianModel.interface';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';

export type ModelRuleScoreAttributes = Optional<
    IAnomalyMonitoringTarget,
    | 'anomalyMonitoringTargetKey'
    | 'subscribedProductKey'
    | 'bayesianModelKey'
    | 'anomalyMonitoringTargetId'
    | 'createdBy'
    | 'updatedBy'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'anomalyMonitoringTargetName'
    | 'anomalyMonitoringTargetDescription'
    | 'anomalyMonitoringTargetStatus'
>;

export class AnomalyMonitoringTargetTable extends Model<IAnomalyMonitoringTarget, ModelRuleScoreAttributes> implements IAnomalyMonitoringTarget {
    public anomalyMonitoringTargetKey: number;
    public subscribedProductKey: number;
    public bayesianModelKey: number;
    public anomalyMonitoringTargetId: string;
    public createdBy: string;
    public updatedBy: string;
    public deletedAt: Date;
   public anomalyMonitoringTargetName: string;
   public anomalyMonitoringTargetDescription: string;
   public anomalyMonitoringTargetStatus: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AnomalyMonitoringTargetTable {
    AnomalyMonitoringTargetTable.init(
        {
            anomalyMonitoringTargetKey: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            anomalyMonitoringTargetId: {
                allowNull: false,
                type: DataTypes.STRING(16),
                unique: true
            },
            bayesianModelKey: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            subscribedProductKey: {
                type: DataTypes.INTEGER,
                allowNull: false
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
            anomalyMonitoringTargetName: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            anomalyMonitoringTargetDescription: {
                type: DataTypes.STRING(500),
                allowNull: false
            },
            anomalyMonitoringTargetStatus: {
                type: DataTypes.STRING(2),
                allowNull: false
            }
        },
        {
            tableName: 'AnomalyMonitoringTarget',
            modelName: 'AnomalyMonitoringTarget',
            indexes: [
                {
                    unique: true,
                    fields: ['anomaly_monitoring_target_id'],
                },
            ],
            sequelize,
        },
    );

    return AnomalyMonitoringTargetTable;
}
