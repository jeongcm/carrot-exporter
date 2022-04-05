import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncident } from '../../../common/interfaces/incident.interface';

export type IncidentCreationAttributes = Optional<
  IIncident,
  'pk' | 'id' | 'tenancyPk' | 'assigneePk' | 'title' | 'note' | 'status' | 'priority' | 'dueDate' | 'createdBy' | 'updatedBy' | 'isDeleted' | 'pinned'
>;

export class IncidentModel extends Model<IIncident, IncidentCreationAttributes> implements IIncident {
  public pk: number;
  public id: string;
  public tenancyPk: number;
  public assigneePk: number;
  public title: string;
  public note: string;
  public status: 'CLOSED' | 'IN_PROGRESS' | 'OPEN' | 'RESOLVED';
  public priority: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT';
  public dueDate: Date;
  public createdBy: number;
  public updatedBy: number;
  public isDeleted: number;
  public pinned: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof IncidentModel {
  IncidentModel.init(
    {
      pk: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      id: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      tenancyPk: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      assigneePk: {
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
        type: DataTypes.DATE,
      },
      createdBy: {
        type: DataTypes.BIGINT,
      },
      updatedBy: {
        type: DataTypes.BIGINT,
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
