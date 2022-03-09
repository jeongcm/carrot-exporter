import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAlert } from '@/common/interfaces/alert.interface';

export type AlertCreationAttributes = Optional<
  IAlert,
  | 'id'
  | 'pk'
  | 'alertName'
  | 'from'
  | 'lastUpdatedAt'
  | 'severity'
  | 'source'
  | 'startAt'
  | 'status'
  | 'summary'
  | 'description'
  | 'alertRule'
  | 'node'
  | 'note'
  | 'tenancyPk'
  | 'numberOfOccurrences'
  | 'pinned'
>;

export class AlertModel extends Model<IAlert, AlertCreationAttributes> implements IAlert {
  public pk: number;
  public id: string;
  public tenancyPk: number;
  public alertName: string;
  public from: 'LARI' | 'PROMETHEUS';
  public severity: string;
  public source: string;
  public status: 'CLOSED' | 'HIDED' | 'OPEN' | 'REFERENCED';
  public summary: string;
  public description: string;
  public alertRule: string;
  public node: string;
  public note: string;
  public numberOfOccurrences: number;
  public pinned: number;

  public readonly lastUpdatedAt!: Date;
  public readonly startAt!: Date;
}

export default function (sequelize: Sequelize): typeof AlertModel {
  AlertModel.init(
    {
      pk: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      id: {
        primaryKey: false,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      tenancyPk: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      alertName: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      from: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      severity: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      source: { type: DataTypes.STRING(45), allowNull: false },
      status: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      note: {
        type: DataTypes.TEXT,
      },
      alertRule: {
        type: DataTypes.TEXT,
      },
      node: {
        type: DataTypes.TEXT,
      },
      numberOfOccurrences: {
        type: DataTypes.INTEGER,
      },
      pinned: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },
      lastUpdatedAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: new Date(),
      },
      startAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: new Date(),
      },
    },
    {
      tableName: 'Alert',
      modelName: 'alert',
      sequelize,
    },
  );

  return AlertModel;
}
