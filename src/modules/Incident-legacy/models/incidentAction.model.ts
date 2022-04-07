import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentAction } from '../../../common/interfaces/incidentAction.interface';

export type IIncidentActionCreationAttributes = Optional<
  IIncidentAction,
  'id' | 'pk' | 'incidentPk' | 'title' | 'description' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class IncidentActionModel extends Model<IIncidentAction, IIncidentActionCreationAttributes> implements IIncidentAction {
  public pk: number;
  public id: string;
  public incidentPk: number;
  public title: string;
  public description: string;
  public createdBy: number;
  public updatedBy: number;
  public isDeleted: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof IncidentActionModel {
  IncidentActionModel.init(
    {
      pk: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      id: {
        primaryKey: false,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      incidentPk: {
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
        type: DataTypes.BIGINT,
        defaultValue: null,
      },
      updatedBy: {
        type: DataTypes.BIGINT,
        defaultValue: null,
      },
      isDeleted: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
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
