import DB from '@/database';
import { IResource } from '@/common/interfaces/resource.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IRelatedResourceResultDto } from '@/common/interfaces/topology.interface';
import ServiceExtension from '@/common/extentions/service.extension';
import { Op, GroupedCountResultItem } from 'sequelize';
import createK8sGraph from './create-k8s-graph';
import filterRelatedGraph from './filter-related-graph';

interface IHashedResources {
  [key: string]: IResource;
}

export const TYPE_PER_NAME: any = {
  statefulset: 'SS',
  daemonset: 'DS',
  replicaset: 'RS',
  deployment: 'DP',
  pod: 'PD',
  service: 'SV',
  volume: 'VM',
  secret: 'SE',
  configmap: 'CM',
  storageclass: 'SC',
  pv: 'PV',
  pvc: 'PC',
  endpoint: 'EP',
  namespace: 'NS',
};

export const NAME_PER_TYPE: any = {
  NS: 'Namespace',
  SS: 'StatefulSet',
  DS: 'DaemonSet',
  RS: 'ReplicaSet',
  DP: 'Deployment',
  PD: 'Pod',
  SV: 'Service',
  VM: 'Volume',
  SE: 'Secret',
  CM: 'ConfigMap',
  SC: 'StorageClass',
  PV: 'PV',
  PC: 'PVC',
  EP: 'Endpoint',
};
class TopologyService extends ServiceExtension {
  public resource = DB.Resource;
  public resourceGroup = DB.ResourceGroup;

  constructor() {
    super({
      tableName: '',
    });
  }

  public async getAllTopology(type: string, customerAccountKey: number, resourceGroupId?: string[], resourceId?: string[]) {
    let where: any = {};
    let extraResourceGroupKey: number[] = [];

    if (resourceId && resourceId.length > 0) {
      const resources: IResource[] = await this.resource.findAll({
        where: {
          resourceId,
          customerAccountKey,
          deletedAt: null,
        },
        attributes: ['resourceGroupKey'],
      });

      extraResourceGroupKey = resources?.map((resource: IResource) => {
        return resource.resourceGroupKey;
      });

      where = {
        [Op.or]: {
          resourceGroupKey: extraResourceGroupKey,
        },
      };
    }

    if (resourceGroupId && resourceGroupId.length > 0) {
      where = {
        ...where,
        resourceGroupId,
      };
    }

    const accountResourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
      where: {
        customerAccountKey,
        deletedAt: null,
        ...where,
      },
    });

    if (!accountResourceGroups) {
      return this.throwError('NOT_FOUND', 'no resource group found');
    }

    const topologyPerGroupId = {};

    await Promise.all(
      accountResourceGroups.map(async (resourceGroup: IResourceGroup) => {
        const children = await this.getResourceGroupTopology(type, resourceGroup, customerAccountKey, resourceId);

        const { resourceGroupName, resourceGroupId, resourceGroupDescription, resourceGroupPlatform, resourceGroupProvider, resourceGroupUuid } = resourceGroup;

        topologyPerGroupId[resourceGroup.resourceGroupId] = {
          resourceGroup: {
            resourceGroupId,
            resourceGroupName,
            resourceGroupDescription,
            resourceGroupPlatform,
            resourceGroupProvider,
            resourceGroupUuid,
          },
          children,
        };
      }),
    );

    return Object.values(topologyPerGroupId);
  }

  public async getResourceGroupTopology(type: string, resourceGroup: IResourceGroup, customerAccountKey: number, resourceId?: string[]) {
    const { resourceGroupKey } = resourceGroup;

    let resourceType: string[] = [];
    let queryOptions: any = {};

    switch (type) {
      case 'nodes':
        resourceType = ['ND'];
        break;
      case 'workload-pods':
        resourceType = ['PD', 'RS', 'DS', 'SS', 'DP', 'CJ', 'JO'];
        queryOptions = {
          [Op.or]: [
            {
              resourceReplicas: { [Op.is]: null },
            },
            {
              resourceReplicas: { [Op.ne]: 0 },
            },
          ],
        };
        break;
      case 'ns-services':
        resourceType = ['NS', 'SV'];
        break;
    }

    const resources: IResource[] = await this.resource.findAll({
      where: {
        customerAccountKey,
        resourceGroupKey,
        resourceType,
        deletedAt: null,
        ...queryOptions,
      },
    });

    if (!resources) {
      return this.throwError('NOT_FOUND', 'no resources');
    }

    switch (type) {
      case 'nodes':
        return await this.createNodeTopology(resources);
      case 'workload-pods':
        return await this.createWorkloadPodTopology(resources, resourceId || []);
      case 'ns-services':
        return await this.createNsServiceTopology(resources, resourceGroup);
    }
  }

  public async createNodeTopology(resources: IResource[]) {
    const topologyItems = [];

    resources.forEach((resource: IResource) => {
      topologyItems.push({
        id: resource.resourceId,
        name: resource.resourceName,
      });
    });

    return topologyItems;
  }

  public async createWorkloadPodTopology(resources: IResource[], resourceId: string[]) {
    const sets: any = {};
    const podsPerUid: any = {};

    let workload = 0;
    let pod = 0;
    let connectedPod = 0;

    resources.forEach((resource: IResource) => {
      const namespace = resource.resourceNamespace;

      switch (resource.resourceType) {
        case 'JO':
        case 'CJ':
        case 'SS':
        case 'DS':
        case 'DP':
        case 'RS':
          if (!sets[resource.resourceNamespace]) {
            sets[namespace] = {};
          }

          workload += 1;

          if (resourceId.length === 0 || resourceId.indexOf(resource.resourceId) > -1) {
            sets[namespace][resource.resourceTargetUuid] = {
              resourceNamespace: namespace,
              resourceName: resource.resourceName,
              resourceId: resource.resourceId,
              resourceTargetUuid: resource.resourceTargetUuid,
              resourceType: resource.resourceType,
              level: 'workload',
              children: [],
            };
          }
          break;
        case 'PD':
          pod += 1;
          let owners = [];
          if (typeof resource.resourceOwnerReferences === 'string') {
            try {
              owners = JSON.parse(resource.resourceOwnerReferences);
            } catch (e) {
              owners = [];
            }
          } else if (resource.resourceOwnerReferences) {
            owners = resource.resourceOwnerReferences;
          } else if (!resource.resourceOwnerReferences) {
            owners = [];
          }

          if (!Array.isArray(owners)) {
            owners = [owners];
          }

          owners?.map((owner: any) => {
            if (owner.uid) {
              if (!podsPerUid[namespace]) {
                podsPerUid[namespace] = {};
              }

              if (!podsPerUid[namespace][owner.uid]) {
                podsPerUid[namespace][owner.uid] = [];
              }

              connectedPod++;
              podsPerUid[namespace][owner.uid].push({
                resourceType: 'PD',
                resourceName: resource.resourceName,
                resourceNamespace: namespace,
                resourceId: resource.resourceId,
                resourceStatusPhase: resource.resourceStatus?.phase,
                level: 'pod',
              });
            }
          });

          break;
      }
    });

    Object.keys(podsPerUid).forEach((namespace: string) => {
      Object.keys(podsPerUid[namespace]).forEach((key: string) => {
        if (sets[namespace] && sets[namespace][key]) {
          sets[namespace][key].children = podsPerUid[namespace][key];
        }
      });
    });

    Object.keys(sets).forEach((namespace: string) => {
      sets[namespace] = {
        level: 'namespace',
        resourceType: 'NS',
        resourceNamespace: namespace,
        children: Object.values(sets[namespace]),
      };
    });

    console.log('total resource:', resources.length, 'total pod:', pod, 'workload', workload, 'workload pod:', connectedPod);
    return Object.values(sets);
  }

  public async countResources(customerAccountKey: number, resourceTypes: string[]): Promise<GroupedCountResultItem[]> {
    const counts: GroupedCountResultItem[] = await this.resource.count({
      where: {
        customerAccountKey,
        resourceType: resourceTypes,
        deletedAt: null,
      },
      attributes: ['resourceType'],
      group: 'resourceType',
    });

    return counts;
  }

  public async countPodResources(customerAccountKey: number): Promise<any> {
    const podPerNamespace: any = await this.getAllTopology('workload-pods', customerAccountKey);
    let myCounts = {
      Clusters: 0,
      Namespaces: 0,
      Pods: 0,
      workloads: 0,
      RS: 0,
      SS: 0,
      DS: 0,
      CJ: 0,
      JO: 0,
    };
    podPerNamespace?.map((podPerNamespaceX: any) => {
      console.log(podPerNamespaceX);
      if (podPerNamespaceX?.resourceGroup) {
        myCounts.Clusters = myCounts.Clusters + 1;
      }
      podPerNamespaceX?.children.map((podPerNamespaceXX: any) => {
        if (podPerNamespaceXX?.resourceType === 'NS') {
          myCounts.Namespaces = myCounts.Namespaces + 1;
        }
        podPerNamespaceXX.children.map((podPerNamespaceXXX: any) => {
          if (podPerNamespaceXXX?.level === 'workload') {
            myCounts.workloads = myCounts.workloads + 1;
            if (podPerNamespaceXXX?.resourceType === 'DP' || podPerNamespaceXXX?.resourceType === 'RS') {
              myCounts.RS = myCounts.RS + 1;
            } else if (podPerNamespaceXXX?.resourceType === 'SS') {
              myCounts.SS = myCounts.SS + 1;
            } else if (podPerNamespaceXXX?.resourceType === 'JO') {
              myCounts.JO = myCounts.JO + 1;
            } else if (podPerNamespaceXXX?.resourceType === 'CJ') {
              myCounts.CJ = myCounts.CJ + 1;
            } else if (podPerNamespaceXXX?.resourceType === 'DS') {
              myCounts.DS = myCounts.DS + 1;
            }
          }
          podPerNamespaceXXX?.children.map((podPerNamespaceXXXX: any) => {
            if (podPerNamespaceXXXX?.resourceType === 'PD') {
              myCounts.Pods = myCounts.Pods + 1;
            }
          });
        });
      });
    });
    return myCounts;
  }

  public async createNsServiceTopology(resources: IResource[], resourceGroup: IResourceGroup) {
    const topologyItems = [];

    resources.forEach((resource: IResource) => {
      if (resource.resourceType === 'SV') {
        topologyItems.push({
          id: resource.resourceId,
          namespace: resource.resourceNamespace,
          resourceGroupId: resourceGroup.resourceGroupId,
        });
      }
    });

    return topologyItems;
  }

  public async getRelatedResources(resourceKey: number, customerAccountKey?: number): Promise<IRelatedResourceResultDto> {
    const customerAccountKeyWhereInsert: any = customerAccountKey ? { customerAccountKey } : {};

    const targetResource: IResource = await this.resource.findOne({
      where: { resourceKey, ...customerAccountKeyWhereInsert, deletedAt: null },
    });

    if (!targetResource) {
      this.throwError('EXCEPTION', 'no resource found');
      //return this.throwError('EXCEPTION', 'no resource found');
    }

    const resourceNamespace = targetResource.resourceType === 'NS' ? targetResource.resourceName : targetResource.resourceNamespace;
    const { resourceGroupKey } = targetResource;

    const resourcesInSameNs: IResource[] = await this.resource.findAll({
      where: {
        customerAccountKey,
        resourceGroupKey,
        deletedAt: null,
        [Op.or]: [
          {
            resourceNamespace,
          },
          {
            resourceType: 'PV',
          },
        ],
      },
      raw: true,
    });

    const { nodes } = await createK8sGraph(
      resourcesInSameNs.map((resource: IResource) => {
        return {
          ...resource,
          resourceNamespace,
        };
      }),
      {},
    );

    if (!nodes || nodes.length === 0) {
      return {
        namespace: resourceNamespace,
        nodes,
        relatedNodes: null,
        flat: [],
      };
    }

    const result = filterRelatedGraph(nodes, targetResource);

    return {
      namespace: resourceNamespace,
      nodes: result.nodes,
      flat: result.flat,
    };
  }
}

export default TopologyService;
