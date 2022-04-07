import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IResource } from '@common/interfaces/resource.interface';

export type ResourceCreationAttributes = Optional<
  IResource,
  | 'resourceKey'
  | 'resourceId'
  | 'resourceGroupKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'resourceName'
  | 'resourceDescription'
  | 'resourceInstance'
  | 'resourceType'
  | 'resourceLevel1'
  | 'resourceLevel2'
  | 'resourceLevel3'
  | 'resourceLevel4'
  | 'resourceLevelType'
  | 'resourceRBAC'
  | 'resourceAnomalyMonitor'
  | 'resourceActive'
  | 'resourceStatus'
  | 'resourceStatusUpdatedAt'
  | 'customerAccountKey'
  | 'parentResourceId'
  | 'resourceNamespace'
>;

export class ResourceModel extends Model<IResource, ResourceCreationAttributes> implements IResource {
  public resourceKey: number;
  public resourceId: string;
  public resourceGroupKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public resourceName: string;
  public resourceDescription: string;
  public resourceInstance: string;
  public resourceType: 'KN' | 'KS' | 'OP';
  public resourceLevel1: 'KN' | 'KS' | 'OP';
  public resourceLevel2: 'KN' | 'KS' | 'OP';
  public resourceLevel3: 'KN' | 'KS' | 'OP';
  public resourceLevel4: 'KN' | 'KS' | 'OP';
  public resourceLevelType: 'KN' | 'KS' | 'OP';
  public resourceRBAC: Boolean;
  public resourceAnomalyMonitor: Boolean;
  public resourceActive: Boolean;
  public resourceStatus: JSON;
  public resourceStatusUpdatedAt: Date;
  public customerAccountKey: number;
  public parentResourceId: string;
  public resourceNamespace: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ResourceModel {
  ResourceModel.init(
    {
      resourceKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      resourceId: {
        allowNull: false,
        type: DataTypes.STRING(16),
        unique: true,
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
      resourceName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      resourceDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      resourceInstance: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      resourceType: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['KN', 'KS', 'OP']],
            msg: 'Resource must be of type KN, KS or OP.',
          },
        },
      },
      resourceLevel1: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['KN', 'KS', 'OP']],
            msg: 'Resource must be of type KN, KS or OP.',
          },
        },
      },
      resourceLevel2: {
        type: DataTypes.STRING(2),
        allowNull: true,
        validate: {
          isIn: {
            args: [['', 'KN', 'KS', 'OP']],
            msg: 'Resource must be of type KN, KS, OP or empty.',
          },
        },
      },
      resourceLevel3: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['', 'KN', 'KS', 'OP']],
            msg: 'Resource must be of type KN, KS, OP or empty.',
          },
        },
      },
      resourceLevel4: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['', 'KN', 'KS', 'OP']],
            msg: 'Resource must be of type KN, KS or OP empty',
          },
        },
      },
      resourceLevelType: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['', 'KN', 'KS', 'OP']],
            msg: 'Resource must be of type KN, KS or OP.',
          },
        },
      },
      resourceRBAC: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      resourceAnomalyMonitor: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      resourceActive: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      resourceStatusUpdatedAt: {
        type: DataTypes.DATE,
      },
      resourceStatus: {
        type: DataTypes.JSON,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },

      resourceGroupKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      parentResourceId: {
        type: DataTypes.STRING(16),
      },
      resourceNamespace: {
        type: DataTypes.STRING(100),
      },
    },
    {
      tableName: 'Resource',
      modelName: 'Resource',
      sequelize,
    },
  );

  return ResourceModel;
}
