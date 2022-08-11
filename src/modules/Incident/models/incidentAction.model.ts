import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentAction } from '../../../common/interfaces/incidentAction.interface';

export type IIncidentActionCreationAttributes = Optional<
  IIncidentAction,
  | 'incidentActionKey'
  | 'incidentActionId'
  | 'incidentKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'incidentActionName'
  | 'incidentActionDescription'
  | 'incidentActionStatus'
  | 'incidentActionExecutedAt'
>;

export class IncidentActionModel extends Model<IIncidentAction, IIncidentActionCreationAttributes> implements IIncidentAction {
  public incidentActionKey: number;
  public incidentActionId: string;
  public incidentKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public incidentActionName: string;
  public incidentActionDescription: string;
  public incidentActionStatus: 'EX' | 'RC' | 'PL' | 'RS' ;
  public incidentActionExecutedAt: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof IncidentActionModel {
  IncidentActionModel.init(
    {
      incidentActionKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      incidentActionId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      incidentKey: {
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
      incidentActionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      incidentActionDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      incidentActionStatus: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      incidentActionExecutedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'IncidentAction',
      modelName: 'incidentAction',
      sequelize,
    },
  );

  return IncidentActionModel;
}
