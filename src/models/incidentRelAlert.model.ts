import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentRelAlert } from './../interfaces/incidentRelAlert.interface';

export type IIncidentRelAlertCreationAttributes = Optional<IIncidentRelAlert,'incidentId' | 'alertId'>;

export class IncidentRelAlertModel extends Model<IIncidentRelAlert, IIncidentRelAlertCreationAttributes> implements IIncidentRelAlert {
  public incidentId: number;
  public alertId: number;
}

export default function (sequelize: Sequelize): typeof IncidentRelAlertModel {
  IncidentRelAlertModel.init(
    {
      incidentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      alertId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'IncidentRelAlert',
      modelName: "IncidentRelAlert",
      sequelize,
      // timestamps: false,
    },
  );

  return IncidentRelAlertModel;
}
