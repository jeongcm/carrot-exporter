import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
import { trimEnd } from "lodash";

export type AlertReceivedCreationAttributes = Optional<
  IAlertReceived,
  | 'alertReceivedKey'
  | 'customerAccountKey'
  | 'alertRuleKey'
  | 'alertReceivedId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'alertReceivedName'
  | 'alertReceivedValue'
  | 'alertReceivedState'
  | 'alertReceivedHash'
  | 'alertReceivedUiFlag'
  | 'alertReceivedNamespace'
  | 'alertReceivedSeverity'
  | 'alertReceivedDescription'
  | 'alertReceivedSummary'
  | 'alertReceivedActiveAt'
  | 'alertReceivedNode'
  | 'alertReceivedService'
  | 'alertReceivedPod'
  | 'alertReceivedInstance'
  | 'alertReceivedLabels'
  | 'alertReceivedPinned'
  | 'alertReceivedContainer'
  | 'alertReceivedEndpoint'
  | 'alertReceivedReason'
  | 'alertReceivedUid'
  | 'alertReceivedHash'
  | 'alertReceivedAffectedResourceType'
  | 'alertReceivedAffectedResourceName'
  | 'alertReceivedPersistentvolumeclaim'
>;

export class AlertReceivedModel extends Model<IAlertReceived, AlertReceivedCreationAttributes> implements IAlertReceived {
  public alertReceivedKey: number;
  public customerAccountKey: number;
  public alertRuleKey: number;
  public alertReceivedId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public alertReceivedHash: string;
  public alertReceivedUiFlag: number;
  public alertReceivedName: string;
  public alertReceivedValue: string;
  public alertReceivedState: string;
  public alertReceivedNamespace: string;
  public alertReceivedSeverity: string;
  public alertReceivedDescription: string;
  public alertReceivedSummary: string;
  public alertReceivedActiveAt: Date;
  public alertReceivedNode: string;
  public alertReceivedService: string;
  public alertReceivedPod: string;
  public alertReceivedInstance: string;
  public alertReceivedLabels: JSON;
  public alertReceivedPinned: boolean;
  public alertReceivedContainer: string;
  public alertReceivedEndpoint: string;
  public alertReceivedReason: string;
  public alertReceivedUid: string;
  public alertReceivedAffectedResourceType: string;
  public alertReceivedAffectedResourceName: string;
  public alertReceivedPersistentvolumeclaim: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AlertReceivedModel {
  AlertReceivedModel.init(
    {
      alertReceivedKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      alertRuleKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      alertReceivedId: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(16),
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
      alertReceivedName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertReceivedValue: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedState: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      alertReceivedNamespace: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedSeverity: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alertReceivedSummary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alertReceivedActiveAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      alertReceivedNode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: '',
      },
      alertReceivedService: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: '',
      },
      alertReceivedPod: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: '',
      },
      alertReceivedInstance: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedContainer: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedEndpoint: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedReason: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedUid: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      alertReceivedHash: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      alertReceivedUiFlag: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      alertReceivedLabels: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      alertReceivedPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      alertReceivedAffectedResourceType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '',
      },
      alertReceivedAffectedResourceName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: '',
      },
      alertReceivedPersistentvolumeclaim: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: '',
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['alert_received_id'],
        },
        {
          unique: false,
          fields: ['alert_received_hash'],
        },
        {
          unique: false,
          fields: ['created_at'],
        },
        {
          unique: false,
          fields: ['deleted_at'],
        },
        {
          unique: false,
          fields: ['alert_received_ui_flag'],
        },
        {
          unique: false,
          fields: ['alert_received_active_at'],
        },
        {
          unique: false,
          fields: ['alert_received_node'],
        },
        {
          unique: false,
          fields: ['alert_received_service'],
        },
        {
          unique: false,
          fields: ['alert_received_pod'],
        },
      ],
      // paranoid: true, //for soft delete
      tableName: 'AlertReceived',
      modelName: 'AlertReceived',
      sequelize,
    },
  );

  return AlertReceivedModel;
}
