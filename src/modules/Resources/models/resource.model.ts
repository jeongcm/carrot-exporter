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
  | 'resourceAnnotations'
  | 'resourceConfigmapData'
  | 'resourceEndpoint'
  | 'resourceIngressClass'
  | 'resourceIngressRules'
  | 'resourceLabels'
  | 'resourceMatchLabels'
  | 'resourcePodContainer'
  | 'resourcePodPhase'
  | 'resourcePvClaimRef'
  | 'resourcePvStorage'
  | 'resourcePvStorageClassName'
  | 'resourcePvVolumeMode'
  | 'resourcePvcStorage'
  | 'resourcePvcStorageClassName'
  | 'resourcePvcVolumeMode'
  | 'resourcePvcVolumeName'
  | 'resourceReplicas'
  | 'resourceScAllowVolumeExpansion'
  | 'resourceScProvisioner'
  | 'resourceScReclaimPolicy'
  | 'resourceScVolumeBindingMode'
  | 'resourceStsVolumeClaimTemplates'
  | 'resourceTargetCreatedAt'
  | 'resourceTargetUuid'
  | 'resourceOwnerReferences'
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
  public resourceType: 'K8' | 'ND' | 'PD' | 'NS' | 'SV' | 'OP' | 'PD' | 'PM' | 'PJ' | 'VM' | 'CT' | 'DP' | 'SS' | 'DS' | 'RS' | 'PV' | 'PC' | 'SE' | 'EP' | 'CM' | 'IG' | 'SC' | 'JO' | 'CJ'  ;
  public resourceLevel1: 'K8' | 'OP';
  public resourceLevel2: 'ND' | 'NS' | 'PJ' | 'PV' | 'SC' ;
  public resourceLevel3: 'PD' | 'SV' | 'PM' | 'DP' | 'SS' | 'DS' | 'RS' | 'PC' | 'SE' | 'EP' | 'CM' | 'IG' | 'JO' | 'CJ' ;
  public resourceLevel4: 'CT' | 'VM';
  public resourceLevelType: 'KN' | 'KS' | 'OP' | 'KC';
  public resourceRbac: Boolean;
  public resourceAnomalyMonitor: Boolean;
  public resourceActive: Boolean;
  public resourceStatus: JSON;
  public resourceStatusUpdatedAt: Date;
  public customerAccountKey: number;
  public parentResourceId: string;
  public resourceNamespace: string;
  public resourcePodPhase: string;
  public resourcePodContainer: JSON;
  public resourcePodVolume: JSON;
  public resourceReplicas: number;
  public resourceStsVolumeClaimTemplates: JSON;
  public resourcePvcStorage: JSON;
  public resourcePvcVolumeName: string;
  public resourcePvcStorageClassName: string;
  public resourcePvcVolumeMode: string;
  public resourceEndpoint: JSON;
  public resourceConfigmapData: JSON;
  public resourceIngressClass: string;
  public resourceIngressRules: string;
  public resourcePvStorage: string;
  public resourcePvClaimRef: string;
  public resourcePvStorageClassName: string;
  public resourcePvVolumeMode: string;
  public resourceScProvisioner: string;
  public resourceScReclaimPolicy: string;
  public resourceScAllowVolumeExpansion: Boolean;
  public resourceScVolumeBindingMode: string;
  public resourceMatchLabels: JSON;
  public resourceLabels: JSON;
  public resourceAnnotations: JSON;
  public resourceTargetUuid: string;
  public resourceTargetCreatedAt: Date;
  public resourceOwnerReferences: JSON;

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
        type: DataTypes.STRING(500),
      },
      resourceDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      resourceInstance: {
        type: DataTypes.STRING(100),
      },
      resourceType: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
            args: [['K8', 'ND', 'PD', 'NS', 'SV', 'OP', 'PD', 'PM', 'PJ', 'VM', 'CT', 'DP', 'SS', 'DS', 'RS', 'PV', 'PC', 'SE','EP','CM','IG','SC', 'JO', 'CJ' ]],
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
            args: [['', 'ND', 'NS', 'PJ', 'PV', 'SC', 'DP', 'SS', 'DS', 'RS', 'PC', 'SE', 'EP', 'CM', 'IG', 'JO', 'CJ']],
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
            args: [['', 'KN', 'KS', 'OP', 'KC']],
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
        unique: 'unique_index',
      },
      resourceGroupKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
        unique: 'unique_index',
      },
      parentResourceId: {
        type: DataTypes.STRING(16),
      },
      resourceNamespace: {
        type: DataTypes.STRING(100),
      },
      resourceTargetUuid: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: 'unique_index',
      },
      resourceTargetCreatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      resourcePodPhase: {
        type: DataTypes.STRING(100),
      },
      resourcePodContainer: {
        type: DataTypes.JSON,
      },
      resourcePodVolume: {
        type: DataTypes.JSON,
      },
      resourceReplicas: {
        type: DataTypes.INTEGER,
      },
      resourceStsVolumeClaimTemplates: {
        type: DataTypes.JSON,
      },
      resourcePvcStorage: {
        type: DataTypes.JSON,
      },
      resourcePvcVolumeName: {
        type: DataTypes.STRING(100),
      },
      resourcePvcStorageClassName: {
        type: DataTypes.STRING(100),
      },
      resourcePvcVolumeMode: {
        type: DataTypes.STRING(100),
      },
      resourceEndpoint: {
        type: DataTypes.JSON,
      },
      resourceConfigmapData: {
        type: DataTypes.JSON,
      },
      resourceIngressClass: {
        type: DataTypes.STRING(100),
      },
      resourceIngressRules: {
        type: DataTypes.JSON,
      },
      resourcePvStorage: {
        type: DataTypes.STRING(100),
      },
      resourcePvClaimRef: {
        type: DataTypes.JSON,
      },
      resourcePvStorageClassName: {
        type: DataTypes.STRING(100),
      },
      resourcePvVolumeMode: {
        type: DataTypes.STRING(100),
      },
      resourceScProvisioner: {
        type: DataTypes.STRING(100),
      },
      resourceScReclaimPolicy: {
        type: DataTypes.STRING(100),
      },
      resourceScAllowVolumeExpansion: {
        type: DataTypes.BOOLEAN,
      },
      resourceScVolumeBindingMode: {
        type: DataTypes.STRING(100),
      },
      resourceMatchLabels: {
        type: DataTypes.JSON,
      },
      resourceLabels: {
        type: DataTypes.JSON,
      },
      resourceAnnotations: {
        type: DataTypes.JSON,
      },
      resourceOwnerReferences: {
        type: DataTypes.JSON,
      },

    },
    {
      indexes: [
        {
          name: 'unique_index',
          unique: true,
          fields: ['resourceTargetUuid', 'customerAccountKey', 'resourceGroupKey'],
        },
      ],
      tableName: 'Resource',
      modelName: 'Resource',
      sequelize,
    },
  );

  return ResourceModel;
}
