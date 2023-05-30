import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { INcpResourceGroup } from '@/common/interfaces/ncpResourceGroup.interface';

export type NcpResourceGroupCreationAttributes = Optional<
  INcpResourceGroup,
  'group_id' | 'group_name' | 'group_desc' | 'create_time' | 'update_time'
>;

export class NcpResourceGroupModel extends Model<INcpResourceGroup, NcpResourceGroupCreationAttributes> implements INcpResourceGroup {
  public customer_uuid: string;
  public account_uuid: string;
  public group_id: string;
  public group_name: string;
  public group_desc: string;
  public create_time: string;
  public update_time: string;
  public del_yn: string;
  public insert_date: Date;
  public created_by: string;
  public created_at: Date;
  public updated_by: string;
  public updated_at: Date;
  public deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof NcpResourceGroupModel {
  NcpResourceGroupModel.init(
    {
      customer_uuid: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      account_uuid: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      group_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      group_name: {
        type: DataTypes.STRING(200),
      },
      group_desc: {
        type: DataTypes.STRING(200),
      },
      create_time: {
        type: DataTypes.STRING(200),
      },
      update_time: {
        type: DataTypes.STRING(5),
      },
      del_yn: {
        type: DataTypes.STRING(1),
      },
      insert_date: {
        type: DataTypes.DATE,
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
      tableName: 'TB_RESOURCE_GROUP',
      modelName: 'NcpResourceGroup',
      sequelize,
    },
  );

  return NcpResourceGroupModel;
}
