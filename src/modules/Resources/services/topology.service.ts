import DB from '@/database';
import { IResource } from '@/common/interfaces/resource.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IRelatedResourceResultDto } from '@/common/interfaces/topology.interface';
import ServiceExtension from '@/common/extentions/service.extension';
import { Op, GroupedCountResultItem } from 'sequelize';
import createK8sGraph from './create-k8s-graph';
import filterRelatedGraph from './filter-related-graph';
import MetricService from '@/modules/Metric/services/metric.service';

interface IHashedResources {
  [key: string]: IResource;
}

// TEMP:
const TEMP_REAL_RESOURCE_NAMES = [
  // VMs
  'acct-svr01',
  'acct-svr02',
  'collector-SaaS',
  'cs_svr01',
  'db_scv01',
  'prd-svr01',
  'prd-svr02',
  'web-svr01',

  // PMs
  'openstack-server',
  'p-com-01',
  'p-com-02',
];

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
  private metricService = new MetricService();

  constructor() {
    super({
      tableName: '',
    });
  }

  public async getAllTopology(type: string, customerAccountKey: number) {
    let where: any = {
      resourceGroupPlatform: 'K8',
    };

    switch (type) {
      case 'pj-vms':
      case 'pms':
        where = {
          resourceGroupPlatform: 'OS',
        };
        break;
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
        const children = await this.getResourceGroupTopology(type, resourceGroup, customerAccountKey);

        const { resourceGroupName, resourceGroupId, resourceGroupDescription, resourceGroupPlatform, resourceGroupProvider, resourceGroupUuid } =
          resourceGroup;

        const resource = await this.resource.findOne({
          where: {
            customerAccountKey,
            resourceTargetUuid: resourceGroupUuid,
          },
        });

        topologyPerGroupId[resourceGroup.resourceGroupId] = {
          resourceGroup: {
            resourceGroupId,
            resourceGroupName,
            resourceGroupDescription,
            resourceGroupPlatform,
            resourceGroupProvider,
            resourceGroupUuid,
          },
          resource,
          children,
        };
      }),
    );

    return Object.values(topologyPerGroupId);
  }

  public async getResourceGroupTopology(type: string, resourceGroup: IResourceGroup, customerAccountKey: number) {
    const { resourceGroupKey } = resourceGroup;

    let resourceType: string[] = [];
    let queryOptions: any = {};

    switch (type) {
      case 'pj-vms':
        resourceType = ['PJ', 'VM'];
        break;
      case 'pms':
        resourceType = ['PM'];
        break;
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

    const { vmStatusPerName, pmStatusPerName } = await this.tempGetStatus(customerAccountKey, [resourceGroup.resourceGroupId]);

    switch (type) {
      case 'pj-vms':
        // TEMP:
        return await this.createPjVmTopology(this.tempInjectStatus(vmStatusPerName, resources));
      case 'pms':
        // TEMP:
        return await this.createPmTopology(this.tempInjectStatus(pmStatusPerName, resources));
      case 'nodes':
        return await this.createNodeTopology(resources);
      case 'workload-pods':
        return await this.createWorkloadPodTopology(resources);
      case 'ns-services':
        return await this.createNsServiceTopology(resources, resourceGroup);
    }
  }

  // TEMP:
  public async tempGetStatus(customerAccountKey: number, resourceGroupIdIn: any) {
    let resourceGroupId = resourceGroupIdIn;

    if (!resourceGroupId || resourceGroupId.length === 0) {
      const accountResourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
        where: {
          customerAccountKey,
          deletedAt: null,
          resourceGroupPlatform: 'OS',
        },
      });

      resourceGroupId = accountResourceGroups.map((rg: any) => {
        return rg.resourceGroupId;
      });
    }

    const metrics: any = await this.metricService.getMetricP8S(customerAccountKey, {
      query: [
        {
          name: 'tempStatus',
          type: 'OS_CLUSTER_PM_VM_ALL_STATUS',
          resourceGroupId: resourceGroupId,
        },
      ],
    });

    const vmStatusPerName = {};
    const pmStatusPerName = {};

    if (!metrics?.tempStatus?.data?.result) {
      return {};
    }

    metrics?.tempStatus?.data?.result.forEach((item: any) => {
      const metric = item.metric || {};
      const value = item.value[1];
      let nodename = metric.nodename;

      switch (metric.job) {
        case 'vm-blackbox-exporter-icmp(acct-svr01)':
          nodename = 'acct-svr01';
          break;
        case 'vm-blackbox-exporter-icmp(acct-svr02)':
          nodename = 'acct-svr02';
          break;
        case 'vm-blackbox-exporter-icmp(cs_svr01)':
          nodename = 'cs_svr01';
          break;
        case 'pm-blackbox-exporter-icmp(p-com-02)':
          nodename = 'p-com-02';
          break;
      }

      if (nodename && metric.job.indexOf('exporter-icmp') > -1) {
        if (metric.alert_resource_type === 'VM') {
          vmStatusPerName[metric.nodename] = parseInt(value);
        }

        if (metric.alert_resource_type === 'PM') {
          pmStatusPerName[metric.nodename] = parseInt(value);
        }
      }
    });

    return {
      vmStatusPerName,
      pmStatusPerName,
    };
  }

  // TEMP:
  public tempInjectStatus(statusPerName: any, resources: any[]) {
    return (resources || []).map((resource: any) => {
      const status = statusPerName[resource.resourceName];

      if (TEMP_REAL_RESOURCE_NAMES.indexOf(resource.resourceName) > -1) {
        if (typeof status !== 'undefined') {
          resource.resourceStatus = status ? 'ACTIVE' : 'INACTIVE';
        } else {
          resource.resourceStatus = 'UNKNOWN';
        }
      }

      return resource;
    });
  }

  public async createPmTopology(resources: IResource[]) {
    const topologyItems = [];

    resources.forEach((resource: IResource) => {
      topologyItems.push({
        id: resource.resourceId,
        name: resource.resourceName,
        createdAt: resource.createdAt,
        resourceStatus: resource.resourceStatus,
      });
    });

    return topologyItems;
  }

  public async createNodeTopology(resources: IResource[]) {
    const topologyItems = [];

    resources.forEach((resource: IResource) => {
      topologyItems.push({
        id: resource.resourceId,
        name: resource.resourceName,
        resource,
      });
    });

    return topologyItems;
  }

  public async createWorkloadPodTopology(resources: IResource[]) {
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

          sets[namespace][resource.resourceTargetUuid] = {
            resourceNamespace: namespace,
            resourceName: resource.resourceName,
            resourceId: resource.resourceId,
            resourceTargetUuid: resource.resourceTargetUuid,
            resourceType: resource.resourceType,
            level: 'workload',
            children: [],
          };
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
            // TODO: Add DaemonSet, StatefulSet, Deployment?
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

  public async countResources(customerAccountKey: number, resourceTypes: string[], resourceGroupIds?: string[]): Promise<GroupedCountResultItem[]> {
    const resourceGroupTypes: string[] = [];
    if (resourceTypes.indexOf('OS') > -1) {
      resourceGroupTypes.push('OS');
      resourceTypes.splice(resourceTypes.indexOf('OS'), 1);
    }

    if (resourceTypes.indexOf('K8') > -1) {
      resourceGroupTypes.push('K8');
      resourceTypes.splice(resourceTypes.indexOf('K8'), 1);
    }

    let where: any = {};
    if (resourceGroupIds) {
      const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
        where: {
          customerAccountKey,
          resourceGroupId: resourceGroupIds,
        },
        attributes: ['resourceGroupKey'],
      });

      if (resourceGroups && resourceGroups.length > 0) {
        where = {
          resourceGroupKey: resourceGroups.map((resourceGroup: IResourceGroup) => {
            return resourceGroup.resourceGroupKey;
          }),
        };
      }
    }

    let counts: GroupedCountResultItem[] = await this.resource.count({
      where: {
        customerAccountKey,
        resourceType: resourceTypes,
        deletedAt: null,
        ...where,
      },
      attributes: ['resourceType'],
      group: 'resourceType',
    });

    if (resourceGroupTypes.length > 0) {
      let resourceCounts: GroupedCountResultItem[] = await this.resourceGroup.count({
        where: {
          customerAccountKey,
          resourceGroupPlatform: resourceGroupTypes,
          deletedAt: null,
        },
        attributes: ['resourceGroupPlatform'],
        group: 'resourceGroupPlatform',
      });

      resourceCounts = resourceCounts.map((resource: GroupedCountResultItem) => {
        return {
          resourceType: resource.resourceGroupPlatform,
          count: resource.count,
        };
      });

      counts = [...counts, ...resourceCounts];
    }

    return counts;
  }

  public async countPodResources(customerAccountKey: number): Promise<any> {
    const podPerNamespace: any = await this.getAllTopology('workload-pods', customerAccountKey);
    const myCounts = {
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

  public async createPjVmTopology(resources: IResource[]) {
    const sets: any = {};

    const pjs = resources.filter(resource => resource.resourceType === 'PJ');
    const vms = resources.filter(resource => resource.resourceType === 'VM');

    // set project
    pjs.forEach((resource: IResource) => {
      let projectUid = '';
      projectUid = resource.resourceTargetUuid;
      if (!sets[projectUid]) {
        sets[projectUid] = {
          level: 'PJ',
          projectUid,
          resourceId: resource.resourceId,
          resourceType: 'PJ',
          resourceName: resource.resourceName,
          resourceDescription: resource.resourceDescription,
          createdAt: resource.createdAt,
          children: [],
        };
      }
    });

    vms.forEach((resource: IResource) => {
      let projectUid = '';
      projectUid = resource.resourceNamespace;

      sets[projectUid].children.push({
        level: 'VM',
        projectUid,
        resourceId: resource.resourceId,
        resourceType: 'VM',
        resourceName: resource.resourceName,
        resourceDescription: resource.resourceDescription,
        createdAt: resource.createdAt,
        resourceStatus: resource.resourceStatus,
      });
    });

    return Object.values(sets);
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
