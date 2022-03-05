import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncident } from './../interfaces/incident.interface';

export type IncidentCreationAttributes = Optional<
  IIncident,
  'id' | 'tenancyId' | 'assigneeId' | 'title' | 'note' | 'status' | 'priority' | 'dueDate' | 'createdBy' | 'updatedBy' | 'isDeleted' | 'pinned'
>;

export class IncidentModel extends Model<IIncident, IncidentCreationAttributes> implements IIncident {
  public id: number;
  public uuid: string;
  public tenancyId: number;
  public assigneeId: number;
  public title: string;
  public note: string;
  public status: 'CLOSED' | 'IN_PROGRESS' | 'OPEN' | 'RESOLVED';
  public priority: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT';
  public dueDate: Date;
  public createdBy: string;
  public updatedBy: string;
  public isDeleted: number;
  public pinned: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof IncidentModel {
  IncidentModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      tenancyId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      assigneeId: {
        type: DataTypes.BIGINT,
      },
      title: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      priority: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE(),
      },
      createdBy: {
        type: DataTypes.UUID,
      },
      updatedBy: {
        type: DataTypes.UUID,
      },
      isDeleted: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      pinned: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
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
