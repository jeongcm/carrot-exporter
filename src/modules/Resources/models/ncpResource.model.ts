import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { INcpResource } from '@common/interfaces/ncpResource.interface';

export type NcpResourceCreationAttributes = Optional<
  INcpResource,
  | 'nrn'
  | 'platformType'
  | 'productName'
  | 'productDisplayName'
  | 'regionCode'
  | 'regionDisplayName'
  | 'resourceType'
  | 'resourceId'
  | 'resourceName'
  | 'createTime'
  | 'eventTime'
>;

export class NcpResourceModel extends Model<INcpResource, NcpResourceCreationAttributes> implements INcpResource {
  public nrn: string;
  public platformType: string;
  public productName: string;
  public productDisplayName: string;
  public regionCode: string;
  public regionDisplayName: string;
  public resourceType: string;
  public resourceId: string;
  public resourceName: string;
  public createTime: string;
  public eventTime: string;
}

export default function (sequelize: Sequelize): typeof NcpResourceModel {
  NcpResourceModel.init(
    {
      nrn: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      platformType: {
        type: DataTypes.STRING(200),
      },
      productName: {
        type: DataTypes.STRING(200),
      },
      productDisplayName: {
        type: DataTypes.STRING(200),
      },
      regionCode: {
        type: DataTypes.STRING(5),
      },
      regionDisplayName: {
        type: DataTypes.STRING(100),
      },
      resourceType: {
        type: DataTypes.STRING(200),
      },
      resourceName: {
        type: DataTypes.STRING(200),
      },
      createTime: {
        type: DataTypes.STRING(13),
      },
      eventTime: {
        type: DataTypes.STRING(13),
      },
      resourceId: {
        type: DataTypes.STRING(100),
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
