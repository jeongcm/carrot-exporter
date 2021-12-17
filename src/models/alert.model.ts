import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IAlert } from '@interfaces/alert.interface';

export type AlertCreationAttributes = Optional<
  IAlert,
  | 'alertName'
  | 'from'
  | 'id'
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
  | 'tenancyId'
  | 'numberOfOccurrences'
>;

export class AlertModel extends Model<IAlert, AlertCreationAttributes> implements IAlert {
  public id: number;
  public tenancyId: string;
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

  public readonly lastUpdatedAt!: Date;
  public readonly startAt!: Date;
}

export default function (sequelize: Sequelize): typeof AlertModel {
  AlertModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      tenancyId: {
        allowNull: false,
        type: DataTypes.UUID,
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
