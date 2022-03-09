import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IClusterAdd } from '@/common/interfaces/cluster.interface';
import { PlatformEnum } from '@/common/enums';

export type ClusterCreationAttributes = Optional<
  IClusterAdd,
  'id' | 'pk' | 'description' | 'global' | 'icon' | 'installParams' | 'name' | 'platform' | 'tags' | 'tenancyPk'
>;

export class ClusterModel extends Model<IClusterAdd, ClusterCreationAttributes> implements IClusterAdd {
  public pk: number;
  public id: string;
  public tenancyPk: number;
  public description: string;
  public global: boolean;
  public icon: string;
  public installParams: string;
  public name: string;
  public platform: PlatformEnum;
  public tags: string;
  public isDeleted: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ClusterModel {
  ClusterModel.init(
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
      tenancyPk: {
        allowNull: true,
        type: DataTypes.BIGINT,
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
