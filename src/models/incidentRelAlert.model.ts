import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentRelAlert } from './../interfaces/incidentRelAlert.interface';

export type IIncidentRelAlertCreationAttributes = Optional<IIncidentRelAlert, 'id' | 'incidentId' | 'alertId'>;

export class IncidentRelAlertModel extends Model<IIncidentRelAlert, IIncidentRelAlertCreationAttributes> implements IIncidentRelAlert {
  public id: string;
  public incidentId: number;
  public alertId: number;
}

export default function (sequelize: Sequelize): typeof IncidentRelAlertModel {
  IncidentRelAlertModel.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
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
      sequelize,
      // timestamps: false,
    },
  );

  return IncidentRelAlertModel;
}
