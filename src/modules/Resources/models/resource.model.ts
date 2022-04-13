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
  | 'resourceRbac'
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
  public resourceType: 'K8' | 'ND' | 'PD' | 'NS' | 'SV' | 'OP' | 'PD' | 'PM' | 'PJ' | 'VM' | 'CT';
  public resourceLevel1: 'K8' | 'OP';
  public resourceLevel2: 'ND' | 'NS' | 'PJ';
  public resourceLevel3: 'PD' | 'SV' | 'PM';
  public resourceLevel4: 'CT' | 'VM';
  public resourceLevelType: 'KN' | 'KS' | 'OP';
  public resourceRbac: Boolean;
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
        unique: true,
      },
      resourceType: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['K8', 'ND', 'PD', 'NS', 'SV', 'OP', 'PD', 'PM', 'PJ', 'VM', 'CT']],
            msg: 'Resource Type must be of type K8, ND, PD, NS, SV, OP, PD, PM, PJ, VM or CT',
          },
        },
      },
      resourceLevel1: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['K8', 'OP']],
            msg: 'Resource level1 must be of type K8 or OP.',
          },
        },
      },
      resourceLevel2: {
        type: DataTypes.STRING(2),
        allowNull: true,
        validate: {
          isIn: {
            args: [['', 'ND', 'NS', 'PJ']],
            msg: 'Resource level2 must be of type ND, NS, PJ or empty.',
          },
        },
      },
      resourceLevel3: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['', 'PD', 'SV', 'PM']],
            msg: 'Resource level3 must be of type PD, SV, PM or empty.',
          },
        },
      },
      resourceLevel4: {
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['', 'CT', 'VM']],
            msg: 'Resource level4 must be of type CT, VM or empty',
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
      resourceRbac: {
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
