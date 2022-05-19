import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentAlertReceived } from '../../../common/interfaces/incidentAlertReceived.interface';

export type IncidentAlertReceivedCreationAttributes = Optional<
  IIncidentAlertReceived,
  | 'incidentAlertReceivedKey'
  | 'incidentAlertReceivedId'
  | 'incidentKey'
  | 'alertReceivedKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
>;

export class IncidentAlertReceivedModel
  extends Model<IIncidentAlertReceived, IncidentAlertReceivedCreationAttributes>
  implements IIncidentAlertReceived
{
  public incidentAlertReceivedKey: number;
  public incidentAlertReceivedId: string;
  public incidentKey: number;
  public alertReceivedKey: number;
  public createdBy: string;
  public updatedBy: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof IncidentAlertReceivedModel {
  IncidentAlertReceivedModel.init(
    {
      incidentAlertReceivedKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      incidentAlertReceivedId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      incidentKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      alertReceivedKey: {
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
      }
    },
    {
      tableName: 'IncidentAlertReceived',
      modelName: 'IncidentAlertReceived',
      sequelize,
      paranoid: true,
    },
  );

  return IncidentAlertReceivedModel;
}
