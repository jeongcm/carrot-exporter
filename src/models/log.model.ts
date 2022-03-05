import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Log } from '@interfaces/log.interface';
import { LogStatus, LogType } from '@/types';

export type AlertCreationAttributes = Optional<
  Log,
  | 'name'
  | 'from'
  | 'type'
  | 'id'
  | 'status'
  | 'isActive'
  | 'createdAt'
  | 'createdBy'
  | 'descriptiveLog'
  | 'hasDescriptiveLog'
  | 'message'
  | 'updatedAt'
  | 'updatedBy'
>;

export class LogModel extends Model<Log, AlertCreationAttributes> implements Log {
  public id: number;
  public uuid: string;
  public name: string;
  public from: 'USER' | 'LARI' | 'SYSTEM';
  public type: LogType;
  public status: LogStatus;
  public isActive: boolean;
  public createdBy: string;
  public updatedBy: string;
  public message: string;
  public hasDescriptiveLog: boolean;
  public descriptiveLog: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof LogModel {
  LogModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      uuid: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      from: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      isActive: {
        allowNull: true,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      hasDescriptiveLog: {
        allowNull: true,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      descriptiveLog: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      message: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      createdAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: new Date(),
      },
      updatedBy: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      updatedAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: new Date(),
      },
    },
    {
      tableName: 'Log',
      sequelize,
    },
  );

  return LogModel;
}
