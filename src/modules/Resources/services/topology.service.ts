import DB from '@/database';
import { IResource } from '@/common/interfaces/resource.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import ServiceExtension from '@/common/extentions/service.extension';

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
        const resourceGroupKey: number = resourceGroup.resourceGroupKey;

        const topology = await this.getResourceGroupTopology(type, resourceGroupKey, customerAccountKey);

        const { resourceGroupName, resourceGroupDescription, resourceGroupPlatform, resourceGroupProvider } = resourceGroup;

        topologyPerGroupId[resourceGroup.resourceGroupId] = {
          resourceGroup: {
            resourceGroupName,
            resourceGroupDescription,
            resourceGroupPlatform,
            resourceGroupProvider,
          },
          topology,
        };
      }),
    );

    return topologyPerGroupId;
  }

  public async getResourceGroupTopology(type: string, resourceGroupKey: number, customerAccountKey: number) {
    let resourceType: string[] = [];

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
        return await this.createNsServiceTopology(resources);
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

  public async createNsServiceTopology(resources: IResource[]) {
    const topologyItems = [];

    resources.forEach((resource: IResource) => {
      topologyItems.push({
        id: resource.resourceId,
        namespace: resource.resourceNamespace,
      });
    });

    return topologyItems;
  }
}

export default TopologyService;
