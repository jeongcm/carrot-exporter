import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IResourceEvent } from '@common/interfaces/resourceEvent.interface';

export type ResourceEventCreationAttributes = Optional<
  IResourceEvent,
  | 'resourceEventKey'
  | 'resourceEventId'
  | 'resourceEventKey'
  | 'resourceEventName'
  | 'resourceEventDescription'
  | 'resourceEventType'
  | 'resourceEventNamespace'
  | 'resourceEventTargetCreatedAt'
  | 'resourceEventTargetUuid'
  | 'resourceEventInvolvedObjectKind'
  | 'resourceEventInvolvedObjectName'
  | 'resourceEventInvolvedObjectNamespace'
  | 'resourceEventReason'
  | 'resourceEventMessage'
  | 'resourceEventSourceComponent'
  | 'resourceEventSourceHost'
  | 'resourceEventFirstTimestamp'
  | 'resourceEventLastTimestamp'
  | 'resourceEventCount'
  | 'customerAccountKey'
  | 'resourceGroupUuid'
  | 'resourceKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class ResourceEventModel extends Model<IResourceEvent, ResourceEventCreationAttributes> implements IResourceEvent {
  public resourceEventKey: number;
  public resourceEventId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public resourceEventName: string;
  public resourceEventDescription: string;
  public resourceEventType: string;
  public resourceEventNamespace: string
  public resourceEventTargetCreatedAt: Date
  public resourceEventTargetUuid: string
  public resourceEventInvolvedObjectKind: string;
  public resourceEventInvolvedObjectName: string;
  public resourceEventInvolvedObjectNamespace: string;
  public resourceEventReason: string;
  public resourceEventMessage: string;
  public resourceEventSourceComponent: string;
  public resourceEventSourceHost: string;
  public resourceEventFirstTimestamp: Date;
  public resourceEventLastTimestamp: Date;
  public resourceEventCount: number;
  public customerAccountKey: number;
  public resourceGroupUuid: string;
  public resourceKey: number

  public updatedAt: Date;

  public readonly createdAt!: Date;
}

export default function (sequelize: Sequelize): typeof ResourceEventModel {
  ResourceEventModel.init(
    {
      resourceEventKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      resourceEventId: {
        allowNull: false,
        type: DataTypes.STRING(100),
        unique: true,
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
      resourceEventName: {
        allowNull: false,
        type: DataTypes.STRING(100),
        unique: true,
      },
      resourceEventDescription: {
        allowNull: true,
        type: DataTypes.STRING(500),
      },
      resourceEventType: {
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      resourceEventNamespace: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      resourceGroupUuid: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      resourceKey: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      resourceEventTargetUuid: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      resourceEventTargetCreatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      resourceEventInvolvedObjectKind: {
        type: DataTypes.STRING(50),
      },
      resourceEventInvolvedObjectName: {
        type: DataTypes.STRING(100),
      },
      resourceEventInvolvedObjectNamespace: {
        type: DataTypes.STRING(100),
      },
      resourceEventReason: {
        type: DataTypes.STRING(100),
      },
      resourceEventMessage: {
        type: DataTypes.STRING(500),
      },
      resourceEventSourceComponent: {
        type: DataTypes.STRING(50),
      },
      resourceEventSourceHost: {
        type: DataTypes.STRING(100),
      },
      resourceEventFirstTimestamp: {
        type: DataTypes.DATE,
      },
      resourceEventLastTimestamp: {
        type: DataTypes.DATE,
      },
      resourceEventCount: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'ResourceEvent',
      modelName: 'ResourceEvent',
      sequelize,
    },
  );

  return ResourceEventModel;
}
