import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAlertTimeline } from '@/common/interfaces/alertTimeline.interface';

export type IAlertTimelineAttributes = Optional<
  IAlertTimeline,
  | 'alertTimelineId'
  | 'alertTimelineKey'
  | 'alertTimelineHash'
  | 'alertTimelineState' // 'firing' | 'pending'
  | 'alertTimelineOriginalState' // 'firing' | 'pending'
  | 'alertTimelineStartAt'
  | 'alertTimelineEndAt'
  | 'alertTimelineLastCheckedAt'
  | 'customerAccountKey'
  | 'resourceGroupKey'
  | 'resourceGroupName'
  | 'resourceGroupUuid'
  | 'alertReceivedIdStart'
  | 'alertReceivedIdEnd'
  | 'alertReceivedHash'
  | 'alertReceivedName'
  | 'alertReceivedNamespace'
  | 'alertReceivedNode'
  | 'alertReceivedService'
  | 'alertReceivedPod'
  | 'alertReceivedSeverity'
  | 'alertReceivedInstance'
  | 'alertReceivedAffectedResourceType'
  | 'alertReceivedAffectedResourceName'
  | 'alertReceivedPersistentvolumeclaim'
  | 'alertRuleGroup'
  | 'alertRuleName'
  | 'alertRuleKey'
  | 'alertRuleId'
  | 'createdBy'
  | 'updatedBy'
  | 'deletedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class AlertTimelineModel extends Model<IAlertTimeline, IAlertTimelineAttributes> implements IAlertTimeline {
  public alertTimelineId: string;
  public alertTimelineKey: number;
  public alertTimelineHash: string;
  public alertTimelineState: string; // 'firing' | 'pending'
  public alertTimelineOriginalState: string; // 'firing' | 'pending'
  public alertTimelineStartAt: Date;
  public alertTimelineEndAt: Date;
  public alertTimelineLastCheckedAt: Date;
  public customerAccountKey: number;
  public resourceGroupKey: number;
  public resourceGroupName: string;
  public resourceGroupUuid: string;
  public alertReceivedIdStart: string;
  public alertReceivedIdEnd: string;
  public alertReceivedName: string;
  public alertReceivedNamespace: string;
  public alertReceivedNode: string;
  public alertReceivedService: string;
  public alertReceivedPod: string;
  public alertReceivedHash: string;
  public alertReceivedSeverity: string;
  public alertReceivedInstance: string;
  public alertReceivedPersistentvolumeclaim: string;
  public alertReceivedAffectedResourceType: string;
  public alertReceivedAffectedResourceName: string;
  public alertRuleGroup: string;
  public alertRuleName: string;
  public alertRuleKey: number;
  public alertRuleId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public deletedBy: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AlertTimelineModel {
  AlertTimelineModel.init(
    {
      alertTimelineId: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      alertTimelineKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      alertTimelineHash: {
        allowNull: true,
        type: DataTypes.STRING(1024),
      },
      alertTimelineState: {
        allowNull: false,
        type: DataTypes.STRING(10),
      },
      alertTimelineOriginalState: {
        allowNull: false,
        type: DataTypes.STRING(10),
      },
      alertTimelineStartAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      alertTimelineEndAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      resourceGroupKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      resourceGroupName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      resourceGroupUuid: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      alertReceivedIdStart: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      alertReceivedIdEnd: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      alertReceivedName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertReceivedNamespace: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedNode: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertReceivedService: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertReceivedPod: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertReceivedSeverity: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertReceivedInstance: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertReceivedAffectedResourceType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      alertReceivedAffectedResourceName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertRuleGroup: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      alertRuleName: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      alertRuleId: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      alertRuleKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      alertTimelineLastCheckedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      createdBy: {
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        defaultValue: null,
        type: DataTypes.STRING(16),
      },
      deletedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      alertReceivedHash: {
        type: DataTypes.STRING(256),
        allowNull: true,
      },
      alertReceivedPersistentvolumeclaim: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: '',
      },
    },
    {
      tableName: 'AlertTimeline',
      modelName: 'AlertTimeline',
      sequelize,
    },
  );

  return AlertTimelineModel;
}
