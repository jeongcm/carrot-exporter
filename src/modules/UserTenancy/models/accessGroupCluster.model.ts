import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupCluster } from '@/common/interfaces/accessGroupCluster.interface';

export type AccessGroupClusterCreationAttributes = Optional<
  AccessGroupCluster,
  'id' | 'pk' | 'accessGroupPk' | 'clusterPk' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupClusterModel extends Model<AccessGroupCluster, AccessGroupClusterCreationAttributes> implements AccessGroupCluster {
  public pk: number;
  public id: string;
  public accessGroupPk: number;
  public clusterPk: number;
  public createdBy: number;
  public updatedBy: number;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof AccessGroupClusterModel {
  AccessGroupClusterModel.init(
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
      accessGroupPk: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      clusterPk: {
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
