import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupCluster } from '@/common/interfaces/accessGroupCluster.interface';

export type AccessGroupClusterCreationAttributes = Optional<
  AccessGroupCluster,
  'id' | 'accessGroupId' | 'clusterId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupClusterModel extends Model<AccessGroupCluster, AccessGroupClusterCreationAttributes> implements AccessGroupCluster {
  public id: number;
  public uuid: string;
  public accessGroupId: number;
  public clusterId: number;
  public createdBy: string;
  public updatedBy: string;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupClusterModel {
  AccessGroupClusterModel.init(
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
      accessGroupId: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      clusterId: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      updatedBy: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'AccessGroupCluster',
      modelName: 'AccessGroupCluster',
      sequelize,
    },
  );

  return AccessGroupClusterModel;
}
