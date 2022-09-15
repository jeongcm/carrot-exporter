import DB from '@/database';
import { IResource } from '@/common/interfaces/resource.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IRelatedResourceResultDto, IResourceCount } from '@/common/interfaces/topology.interface';
import ServiceExtension from '@/common/extentions/service.extension';
import { Op } from 'sequelize';
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

  public async getAllTopology(type: string, customerAccountKey: number) {
    const accountResourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
      where: {
        customerAccountKey,
        deletedAt: null,
      },
    });

    if (!accountResourceGroups) {
      return this.throwError('NOT_FOUND', 'no resource group found');
    }

    const topologyPerGroupId = {};

    await Promise.all(
      accountResourceGroups.map(async (resourceGroup: IResourceGroup) => {
        const topology = await this.getResourceGroupTopology(type, resourceGroup, customerAccountKey);

        const { resourceGroupName, resourceGroupId, resourceGroupDescription, resourceGroupPlatform, resourceGroupProvider } = resourceGroup;

        topologyPerGroupId[resourceGroup.resourceGroupId] = {
          resourceGroup: {
            resourceGroupId,
            resourceGroupName,
            resourceGroupDescription,
            resourceGroupPlatform,
            resourceGroupProvider,
          },
          topology: (topology || []).map((item: any) => {
            return {
              ...item,
              resourceGroupId,
            };
          }),
        };
      }),
    );

    return topologyPerGroupId;
  }

  public async getResourceGroupTopology(type: string, resourceGroup: IResourceGroup, customerAccountKey: number) {
    let resourceType: string[] = [];
    const { resourceGroupKey } = resourceGroup;

    switch (type) {
      case 'nodes':
        resourceType = ['ND'];
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
      },
    });

    if (!resources) {
      return this.throwError('NOT_FOUND', 'no resources');
    }

    switch (type) {
      case 'nodes':
        return await this.createNodesTopology(resources);
      case 'ns-services':
        return await this.createNsServiceTopology(resources, resourceGroup);
    }
  }

  public async createNodesTopology(resources: IResource[]) {
    const topologyItems = [];

    resources.forEach((resource: IResource) => {
      topologyItems.push({
        id: resource.resourceId,
      });
    });

    return topologyItems;
  }

  public async countResources(customerAccountKey: number, resourceTypes: string[]): IResourceCount[] {
    const counts: IResourceCount[] = await this.resource.count({
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
