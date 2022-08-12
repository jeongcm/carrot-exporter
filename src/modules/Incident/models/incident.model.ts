import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncident } from '../../../common/interfaces/incident.interface';

export type IncidentCreationAttributes = Optional<
  IIncident,
  | 'incidentKey'
  | 'incidentId'
  | 'assigneeKey'
  | 'customerAccountKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'incidentName'
  | 'incidentDescription'
  | 'incidentStatus'
  | 'incidentSeverity'
  | 'incidentDueDate'
  | 'incidentPinned'
>;

export class IncidentModel extends Model<IIncident, IncidentCreationAttributes> implements IIncident {
  public incidentKey: number;
  public incidentId: string;
  public assigneeKey: number;
  public customerAccountKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public incidentName: string;
  public incidentDescription: string;
  public incidentStatus: '3O' | '2I' | '1R' | '0C';
  public incidentSeverity: '3U' | '2H' | '1M' | '0L';
  public incidentDueDate: Date;
  public incidentPinned: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof IncidentModel {
  IncidentModel.init(
    {
      incidentKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      incidentId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      assigneeKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      customerAccountKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      incidentName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      incidentDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      incidentStatus: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      incidentSeverity: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      incidentDueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      incidentPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'Incident',
      modelName: 'incident',
      sequelize,
    },
  );

  return IncidentModel;
}
