import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { INcpResourceGroup } from '@/common/interfaces/ncpResourceGroup.interface';

export type NcpResourceGroupCreationAttributes = Optional<
  INcpResourceGroup,
  'group_id' | 'group_name' | 'group_desc' | 'create_time' | 'update_time'
>;

export class NcpResourceGroupModel extends Model<INcpResourceGroup, NcpResourceGroupCreationAttributes> implements INcpResourceGroup {
  public group_id: string;
  public group_name: string;
  public group_desc: string;
  public create_time: string;
  public update_time: string;
}

export default function (sequelize: Sequelize): typeof NcpResourceGroupModel {
  NcpResourceGroupModel.init(
    {
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
    },
    {
      tableName: 'TB_RESOURCE_GROUP',
      modelName: 'NcpResourceGroup',
      sequelize,
    },
  );

  return NcpResourceGroupModel;
}
