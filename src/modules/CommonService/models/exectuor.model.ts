import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ISudoryWebhook } from '@/common/interfaces/sudoryWebhook.interface';

export type SudoryWebhookUpdateAttributes = Optional<
ISudoryWebhook,
  | 'sudoryWebhookKey'
  | 'sudoryWebhookId'
  | 'clusterUuid' 
  | 'status' 
  | 'serviceUuid'
  | 'serviceName' 
  | 'serviceResult'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'deletedAt'
>;

export class SudoryWebhookModel extends Model<ISudoryWebhook, SudoryWebhookUpdateAttributes> implements ISudoryWebhook {
  public sudoryWebhookKey: number;
  public sudoryWebhookId: string;
  public clusterUuid: string;
  public status: number;
  public serviceUuid: string;
  public serviceName: string;
  public serviceResult: JSON;

  public deletedAt: Date;
  public createdBy: string;
  public updatedBy: string;
  public updatedAt: Date;

  public readonly createdAt!: Date;

}

export default function (sequelize: Sequelize): typeof SudoryWebhookModel {
  SudoryWebhookModel.init(
    {
      sudoryWebhookKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      sudoryWebhookId: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
      },
      clusterUuid: {
        type: DataTypes.STRING(100),
      },
      serviceUuid: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      serviceName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      serviceResult: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
    },
    {
      tableName: 'SudoryWebhook',
      modelName: 'SudoryWebhook',
      sequelize,
    },
  );

  return SudoryWebhookModel;
}
