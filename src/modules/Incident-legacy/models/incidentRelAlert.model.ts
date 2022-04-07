import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentRelAlert } from '../../../common/interfaces/incidentRelAlert.interface';

export type IIncidentRelAlertCreationAttributes = Optional<IIncidentRelAlert, 'incidentPk' | 'alertPk'>;

export class IncidentRelAlertModel extends Model<IIncidentRelAlert, IIncidentRelAlertCreationAttributes> implements IIncidentRelAlert {
  public incidentPk: number;
  public alertPk: number;
}

export default function (sequelize: Sequelize): typeof IncidentRelAlertModel {
  IncidentRelAlertModel.init(
    {
      incidentPk: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      alertPk: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: 'IncidentRelAlert',
      modelName: 'IncidentRelAlert',
      sequelize,
      // timestamps: false,
    },
  );

  return IncidentRelAlertModel;
}
