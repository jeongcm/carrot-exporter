import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IResourceGroup } from '@common/interfaces/resourceGroup.interface';

export type ResourceGroupCreationAttributes = Optional<
  IResourceGroup,
  | 'resourceGroupKey'
  | 'resourceGroupId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'resourceGroupName'
  | 'resourceGroupDescription'
  | 'customerAccountKey'
  | 'resourceGroupPlatform'
  | 'resourceGroupPrometheus'
  | 'resourceGroupProvider'
  | 'resoruceGroupAlertManager'
  | 'resourceGroupGrafana'
  | 'resourceGroupLoki'
  | 'resourceGroupUuid'
>;

export class ResourceGroupModel extends Model<IResourceGroup, ResourceGroupCreationAttributes> implements IResourceGroup {
  public resourceGroupKey: number;
  public resourceGroupId: string;
  public resourceGroupGroupKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public resourceGroupName: string;
  public resourceGroupDescription: string;
  public customerAccountKey: number;
  public resourceGroupPlatform: 'OS' | 'K8';
  public resourceGroupPrometheus: string;
  public resoruceGroupAlertManager: string;
  public resourceGroupLoki: string;
  public resourceGroupGrafana: string;
  public resourceGroupProvider: 'AW' | 'GC' | 'DO' | 'AZ' | 'PR' | 'OR' | 'OT';
  public resourceGroupUuid: string;
  public updatedAt: Date;

  public readonly createdAt!: Date;
  
}

export default function (sequelize: Sequelize): typeof ResourceGroupModel {
  ResourceGroupModel.init(
    {
      resourceGroupKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      resourceGroupId: {
        allowNull: false,
        type: DataTypes.STRING(16),
        unique: true,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      resourceGroupName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      resourceGroupDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      resourceGroupPlatform: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['OS', 'K8']],
            msg: 'resourceGroupPlatform must be of type OS or K8',
          },
        },
      },
      resourceGroupProvider: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['AW', 'GC', 'DO', 'AZ', 'PR', 'OR', 'OT']],
            msg: 'resourceGroupProvider must be of type AW, GC, DO, AZ, PR, OR or OT',
          },
        },
      },
      resourceGroupUuid: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      resourceGroupPrometheus: {
        allowNull: true,
        type: DataTypes.STRING(200),
      },
      resourceGroupGrafana: {
        allowNull: true,
        type: DataTypes.STRING(200),
      },
      resoruceGroupAlertManager: {
        allowNull: true,
        type: DataTypes.STRING(200),
      },
      resourceGroupLoki: {
        allowNull: true,
        type: DataTypes.STRING(200),
      },
    },
    {
      tableName: 'ResourceGroup',
      modelName: 'ResourceGroup',
      sequelize,
    },
  );

  return ResourceGroupModel;
}
