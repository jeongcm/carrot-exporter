import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AccessGroupCluster } from '@interfaces/accessGroupCluster.interface';

export type AccessGroupClusterCreationAttributes = Optional<
  AccessGroupCluster,
  'id' | 'groupId' | 'clusterId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export class AccessGroupClusterModel extends Model<AccessGroupCluster, AccessGroupClusterCreationAttributes> implements AccessGroupCluster {
  public id: string;
  public groupId: string;
  public clusterId: string;
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
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      groupId: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      clusterId: {
        allowNull: false,
        type: DataTypes.STRING(45),
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
      sequelize,
    },
  );

  return AccessGroupClusterModel;
}
