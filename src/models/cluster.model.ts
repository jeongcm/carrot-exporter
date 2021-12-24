import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IClusterAdd } from '@interfaces/cluster.interface';

export type ClusterCreationAttributes = Optional<
  IClusterAdd,
  'id' | 'description' | 'global' | 'icon' | 'installParams' | 'name' | 'platform' | 'tags' | 'tenancyId'
>;

export class ClusterModel extends Model<IClusterAdd, ClusterCreationAttributes> implements IClusterAdd {
  public id: string;
  public description: string;
  public global: boolean;
  public icon: string;
  public installParams: string;
  public name: string;
  public platform: 'AWS' | 'baremetal' | 'kubernetes';
  public tags: string;
  public tenancyId: string;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ClusterModel {
  ClusterModel.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      global: {
        allowNull: true,
        type: DataTypes.BOOLEAN,
      },
      icon: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      installParams: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      platform: {
        allowNull: false,
        type: DataTypes.STRING(45),
      },
      tags: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      tenancyId: {
        allowNull: true,
        type: DataTypes.STRING(45),
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      tableName: 'Cluster',
      modelName: 'Cluster',
      sequelize,
    },
  );

  return ClusterModel;
}
