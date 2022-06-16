import DB from '@/database';
import { IResource } from '@/common/interfaces/resource.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IRelatedResourceResultDto, IRelatedResource } from '@/common/interfaces/topology.interface';
import ServiceExtension from '@/common/extentions/service.extension';
import { Op } from 'sequelize';
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

  public async getRelatedResources(resourceKey: number, customerAccountKey?: number): Promise<IRelatedResourceResultDto> {
    const customerAccountKeyWhereInsert: any = customerAccountKey ? { customerAccountKey } : {};

    const resource: IResource = await this.resource.findOne({
      where: { resourceKey, ...customerAccountKeyWhereInsert },
    });

    if (!resource) {
      return this.throwError('EXCEPTION', 'no resource found');
    }

    const resourceNamespace = resource.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace;
    const { resourceGroupKey } = resource;

    const resourcesInSameNs: IResource[] = await this.resource.findAll({
      where: {
        customerAccountKey,
        resourceGroupKey,
        [Op.or]: [
          {
            resourceNamespace,
          },
        ],
      },
    });

    const flat = this.getFlatResourceList(resourcesInSameNs);
    const nodes = this.getRelatedResourceNodes(resourcesInSameNs);

    return {
      namespace: resourceNamespace,
      nodes,
      flat,
    }
  }

  private getFlatResourceList(resourcesInSameNs: IResource[]): IRelatedResource[] {
    return resourcesInSameNs.map(({ resourceKey, resourceId, resourceGroupKey, resourceType, resourceName }) => {
      const related: IRelatedResource = {
        resourceKey,
        resourceId,
        resourceGroupKey,
        resourceType,
        resourceName,
      };
      return related;
    });
  }

  private getRelatedResourceNodes(resources: IResource[]) {

  }
}

export default TopologyService;
