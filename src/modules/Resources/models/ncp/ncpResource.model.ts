import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { INcpResource } from '@common/interfaces/ncpResource.interface';

export type NcpResourceCreationAttributes = Optional<
  INcpResource,
  | 'nrn'
  | 'platform_type'
  | 'product_name'
  | 'product_display_name'
  | 'region_code'
  | 'region_display_name'
  | 'resource_type'
  | 'resource_id'
  | 'resource_name'
  | 'create_time'
  | 'event_time'
  | 'created_by'
  | 'created_at'
  | 'updated_by'
  | 'updated_at'
  | 'deleted_at'
>;

export class NcpResourceModel extends Model<INcpResource, NcpResourceCreationAttributes> implements INcpResource {
  public nrn: string;
  public platform_type: string;
  public product_name: string;
  public product_display_name: string;
  public region_code: string;
  public region_display_name: string;
  public resource_type: string;
  public resource_id: string;
  public resource_name: string;
  public create_time: string;
  public event_time: string;
  public created_by: string;
  public created_at: Date;
  public updated_by: string;
  public updated_at: Date;
  public deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof NcpResourceModel {
  NcpResourceModel.init(
    {
      nrn: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      platform_type: {
        type: DataTypes.STRING(200),
      },
      product_name: {
        type: DataTypes.STRING(200),
      },
      product_display_name: {
        type: DataTypes.STRING(200),
      },
      region_code: {
        type: DataTypes.STRING(5),
      },
      region_display_name: {
        type: DataTypes.STRING(100),
      },
      resource_type: {
        type: DataTypes.STRING(200),
      },
      resource_name: {
        type: DataTypes.STRING(200),
      },
      create_time: {
        type: DataTypes.STRING(13),
      },
      event_time: {
        type: DataTypes.STRING(13),
      },
      resource_id: {
        type: DataTypes.STRING(100),
      },
      created_by: {
        type: DataTypes.STRING(36),
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_by: {
        type: DataTypes.STRING(36),
      },
      updated_at: {
        type: DataTypes.DATE,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'TB_RESOURCE',
      modelName: 'NcpResource',
      sequelize,
    },
  );

  return NcpResourceModel;
}
