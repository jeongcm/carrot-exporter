import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentRelAlert } from './../interfaces/incidentRelAlert.interface';

export type IIncidentRelAlertCreationAttributes = Optional<IIncidentRelAlert, 'id' | 'incidentId' | 'alertId'>;

export class IncidentRelAlertModel extends Model<IIncidentRelAlert, IIncidentRelAlertCreationAttributes> implements IIncidentRelAlert {
  public id: number;
  public incidentId: number;
  public alertId: number;
}

export default function (sequelize: Sequelize): typeof IncidentRelAlertModel {
  IncidentRelAlertModel.init(
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
      alertId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: 'IncidentRelAlert',
      sequelize,
      timestamps: false,
    },
  );

  return IncidentRelAlertModel;
}
