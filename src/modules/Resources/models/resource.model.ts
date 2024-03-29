import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IResource } from '@common/interfaces/resource.interface';
import { ResourceType, ResourceTypeLevel1, ResourceTypeLevel2, ResourceTypeLevel3, ResourceTypeLevel4, ResourceTypeLevel5 } from 'common/types';

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
  | 'resourceSpec'
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
  | 'resourceApp'
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
  public resourceSpec: any;
  public resourceType: ResourceType;
  public resourceLevel1: ResourceTypeLevel1;
  public resourceLevel2: ResourceTypeLevel2;
  public resourceLevel3: ResourceTypeLevel3;
  public resourceLevel4: ResourceTypeLevel4;
  public resourceLevel5: ResourceTypeLevel5;
  public resourceLevelType: 'KN' | 'KS' | 'OS' | 'K8' | 'OX' | 'NX' | 'NC';
  public resourceRbac: Boolean;
  public resourceAnomalyMonitor: Boolean;
  public resourceActive: Boolean;
  public resourceStatus: any;
  public resourceStatusUpdatedAt: Date;
  public customerAccountKey: number;
  public parentResourceId: string;
  public resourceNamespace: string;
  public resourcePodPhase: string;
  public resourcePodContainer: any;
  public resourcePodVolume: any;
  public resourceReplicas: number;
  public resourceStsVolumeClaimTemplates: any;
  public resourcePvcStorage: any;
  public resourcePvcVolumeName: string;
  public resourcePvcStorageClassName: string;
  public resourcePvcVolumeMode: string;
  public resourceEndpoint: any;
  public resourceConfigmapData: any;
  public resourceIngressClass: string;
  public resourceIngressRules: any;
  public resourcePvStorage: string;
  public resourcePvClaimRef: any;
  public resourcePvStorageClassName: string;
  public resourcePvVolumeMode: string;
  public resourceScProvisioner: string;
  public resourceScReclaimPolicy: string;
  public resourceScAllowVolumeExpansion: Boolean;
  public resourceScVolumeBindingMode: string;
  public resourceMatchLabels: any;
  public resourceLabels: any;
  public resourceAnnotations: any;
  public resourceTargetUuid: string;
  public resourceTargetCreatedAt: Date;
  public resourceOwnerReferences: any;
  public resourceApp: string;

  public updatedAt: Date;

  public readonly createdAt!: Date;
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
        type: DataTypes.STRING(100),
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
      resourceSpec: {
        type: DataTypes.JSON,
      },
      resourceInstance: {
        type: DataTypes.STRING(100),
      },
      resourceType: {
        allowNull: false,
        type: DataTypes.STRING(10),
        validate: {
          isIn: {
            args: [
              [
                'K8',
                'ND',
                'PD',
                'NS',
                'SV',
                'OS',
                'PM',
                'PJ',
                'VM', // it means openstack vm, ncp serverInstance (공통의 타입으로 쓰임)
                'CT',
                'DP',
                'SS', // it means kubernetes statefulSet, ncp snapshot
                'DS',
                'RS',
                'PV',
                'PC',
                'SE',
                'EP',
                'CM',
                'IG',
                'SC',
                'JO',
                'CJ',
                'EV',
                'NCP',
                'RG',
                'VPC',
                'SBN',
                'ACL',
                'RT',
                'LB',
                'TG',
                'NET',
                'ACG',
                'PIP',
                'BLS',
                'SIMG',
                'PLG',
                'INS',
                'DBMYSQL',
                'DBPGQL',
                'DBMONGO',
                'DBMSQL',
                'DBREDIS',
                'NAS',
                'NASSS',
                'OBS',
                'NKS',
                'NKSNP',
                'NKSWN',
                'DBMYSQLVM',
                'DBPGQLVM',
                'DBMONGOVM',
                'DBMSQLVM',
                'DBREDISVM',
              ],
            ],
            msg: 'invalid resource type',
          },
        },
      },
      resourceLevel1: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isIn: {
            args: [['K8', 'OS', 'NCP']],
            msg: 'invalid Resource level1',
          },
        },
      },
      resourceLevel2: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          isIn: {
            args: [['', 'ND', 'NS', 'PJ', 'PV', 'SC', 'DP', 'SS', 'DS', 'RS', 'PC', 'SE', 'EP', 'CM', 'IG', 'JO', 'CJ', 'EV', 'PM', 'RG']],
            msg: 'invalid Resource level2.',
          },
        },
      },
      resourceLevel3: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          isIn: {
            args: [['', 'ND', 'NS', 'VM', 'PV', 'SC', 'DP', 'SS', 'DS', 'RS', 'PC', 'SE', 'EP', 'CM', 'IG', 'JO', 'CJ', 'EV', 'VPC']],
            msg: 'invalid Resource level3.',
          },
        },
      },
      resourceLevel4: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          isIn: {
            args: [['', 'WL', 'SBN', 'ACL', 'RT', 'LB', 'TG']],
            msg: 'invalid Resource level4',
          },
        },
      },
      resourceLevel5: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          isIn: {
            args: [['VM', 'NET', 'ACG', 'PIP', 'BLS', 'SS', 'SIMG', 'PLG', 'INS', 'DBMYSQL', 'DBPGQL', 'DBMONGO', 'DBMSQL', 'DBREDIS', 'NAS', 'NASSS', 'OBS', 'NKS', 'NKSNP', 'NKSWN', 'DBMYSQLVM', 'DBMONGOVM', 'DBREDISVM', 'DBPGQLVM']],
            msg: 'invalid Resource level5',
          },
        },
      },
      resourceLevelType: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isIn: {
            args: [['', 'KN', 'KS', 'OS', 'K8', 'OX', 'NX', 'NC']],
            msg: 'invalid Resource level type.',
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
      resourceApp: {
        type: DataTypes.STRING(100),
      },
    },
    {
      indexes: [
        {
          name: 'unique_index',
          unique: true,
          fields: ['resourceTargetUuid', 'resourceGroupKey', 'deletedAt', 'resourceType'],
        },
        {
          fields: ['resource_name'],
        },
        {
          fields: ['resource_type'],
        },
        {
          fields: ['resource_app'],
        },
      ],
      tableName: 'Resource',
      modelName: 'Resource',
      sequelize,
    },
  );

  return ResourceModel;
}
