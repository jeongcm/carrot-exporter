import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IGrafanaSetting {
  grafanaSettingKey: number;
  grafanaSettingId: string;
  resourceGroupKey: number;
  customerAccountKey: number;
  grafanaUrl: string;
  configJson: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export type GrafanaSettingCreationAttributes = Optional<
  IGrafanaSetting,
  'grafanaSettingId' | 'grafanaSettingKey' | 'resourceGroupKey' | 'createdAt' | 'createdBy' | 'grafanaUrl' | 'configJson' | 'updatedAt' | 'updatedBy'
>;

export class GrafanaSettingModel extends Model<IGrafanaSetting, GrafanaSettingCreationAttributes> implements IGrafanaSetting {
  public grafanaSettingKey: number;
  public grafanaSettingId: string;
  public customerAccountKey: number;
  public resourceGroupKey: number;
  public grafanaUrl: string;
  public configJson: string;
  public createdBy: number;
  public updatedBy: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof GrafanaSettingModel {
  GrafanaSettingModel.init(
    {
      grafanaSettingKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      grafanaSettingId: {
        primaryKey: false,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      resourceGroupKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
        unique: 'unique_index',
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
        unique: 'unique_index',
      },
      grafanaUrl: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      configJson: {
        type: DataTypes.TEXT,
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
      modelName: 'GrafanaSetting',
      tableName: 'GrafanaSetting',
      sequelize,
    },
  );

  return GrafanaSettingModel;
}
