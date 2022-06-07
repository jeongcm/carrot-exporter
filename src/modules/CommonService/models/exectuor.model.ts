import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ISudoryWebhook } from '@/common/interfaces/sudoryWebhook.interface';

export type SudoryWebhookUpdateAttributes = Optional<
ISudoryWebhook,
  | 'sudoryWebhookKey'
  | 'sudoryWebhookId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'deletedAt'
  | 'serviceUuid'
  | 'serviceResult'
>;

export class SudoryWebhookModel extends Model<ISudoryWebhook, SudoryWebhookUpdateAttributes> implements ISudoryWebhook {
  public sudoryWebhookKey: number;
  public sudoryWebhookId: string;

  public serviceUuid: string;
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
      serviceUuid: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
      },
      serviceResult: {
        allowNull: false,
        type: DataTypes.JSON,
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
