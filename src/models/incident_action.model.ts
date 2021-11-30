import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentAction } from './../interfaces/incident_action.interface';

export type IIncidentActionCreationAttributes = Optional<
  IIncidentAction,
  'id' | 'incidentId' | 'title' | 'description' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class IncidentActionModel extends Model<IIncidentAction, IIncidentActionCreationAttributes> implements IIncidentAction {
  public id: number;
  public incidentId: number;
  public title: string;
  public description: string;
  public createdBy: string;
  public updatedBy: string;
  public isDeleted: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof IncidentActionModel {
  IncidentActionModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      incidentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      createdBy: {
        type: DataTypes.UUID,
        defaultValue: null,
      },
      updatedBy: {
        type: DataTypes.UUID,
        defaultValue: null,
      },
      isDeleted: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'Incident_Action',
      modelName: 'incidentAction',
      sequelize,
    },
  );

  return IncidentActionModel;
}
