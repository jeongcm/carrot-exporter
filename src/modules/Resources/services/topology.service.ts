import DB from '@/database';
import { IResource } from '@/common/interfaces/resource.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IRelatedResourceResultDto, IRelatedResource } from '@/common/interfaces/topology.interface';
import ServiceExtension from '@/common/extentions/service.extension';
import { Op } from 'sequelize';
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

    const targetResource: IResource = await this.resource.findOne({
      where: { resourceKey, ...customerAccountKeyWhereInsert },
    });

    if (!targetResource) {
      return this.throwError('EXCEPTION', 'no resource found');
    }

    const resourceNamespace = targetResource.resourceType === 'NS' ? targetResource.resourceName : targetResource.resourceNamespace;
    const { resourceGroupKey } = targetResource;

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

    const nsFlat = this.getFlatResourceList(resourcesInSameNs);
    const [nodes, flat] = this.getRelatedResourceNodes(resourceNamespace, targetResource, resourcesInSameNs);

    return {
      namespace: resourceNamespace,
      nodes,
      flat,
      nsFlat,
    };
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

  private getRelatedResourceNodes(targetNamespace: string, targetResource: IResource, resources: IResource[]) {
    const targetType: string = targetResource.resourceType;
    const hashedResource: IHashedResources = {};
    let flat: IHashedResources[] = [];
    const pods: IResource[] = [];

    // STEP 1: Create a hashmap per id and name and collect pods
    resources.forEach((resource: IResource) => {
      const { resourceType, resourceId, resourceName } = resource;
      const resourceNamespace = resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace;
      const idHash = `id.${resourceType}.${resourceId}`;
      const nameHash = `name.${resourceType}.${resourceName}`;

      hashedResource[idHash] = resource;
      hashedResource[nameHash] = resource;
      if (resourceType === 'PD') {
        if (targetType !== 'PD' || (targetType !== 'PD' && resource.resourceId !== targetResource.resourceId)) {
          pods.push(resource);
        }
      }
    });

    const { resourceKey, resourceId, resourceGroupKey, resourceType, resourceName } = targetResource;
    const includedIdLabels: string[] = [`id.${resourceType}.${resourceId}`, `name.${resourceType}.${resourceName}`];

    let nodes: IRelatedResource = {
      resourceKey,
      resourceId,
      resourceGroupKey,
      resourceType,
      resourceName,
      // resource: targetResource,
      relatedResources: [],
    };

    // STEP 2: Decide strategy
    switch (targetType) {
      case 'PD':
        break;
      default:
        pods.forEach((pod: IResource) => {
          const result = this.getPodRelatedResource(includedIdLabels, nodes, {
            flat,
            targetNamespace,
            pod,
            targetResource,
            hashedResource,
          });
          nodes = result[0];
          flat = result[1];
        });
        break;
    }

    return [nodes, flat];
  }

  private getPodRelatedResource(includedIdLabels, nodes: IRelatedResource, opts: any) {
    const { targetNamespace, pod, targetResource } = opts;

    const podIdHash = `id.${pod.resourceType}.${pod.resourceId}`;
    const targetIdHash = `id.${targetResource.resourceType}.${targetResource.resourceId}`;
    const targetNameHash = `name.${targetResource.resourceType}.${targetResource.resourceName}`;

    (pod.resourceOwnerReferences || []).map((owner: any) => {
      const type = TYPE_PER_NAME[(owner.kind || '').toLowerCase()];
      const uid = owner.uid;
    });

    (pod.resourcePodVolume || []).forEach((volume: any) => {
      let target = '';

      if (volume.persistentVolumeClaim) {
        target = `name.PC.${volume.persistentVolumeClaim.claimName}`;
      } else if (volume.configMap) {
        target = `name.CM.${volume.configMap.name}`;
      } else if (volume.secret) {
        target = `name.SE.${volume.secret.secretName}`;
      }

      if (targetIdHash === target) {
        nodes = this.addResourceToNodes(podIdHash, includedIdLabels, nodes, opts);
      } else if (targetNameHash === target) {
        nodes = this.addResourceToNodes(podIdHash, includedIdLabels, nodes, opts);
      }
    });

    (pod.resourcePodContainer || []).forEach((container: any) => {
      let target = '';
      (container.env || []).forEach((env: any) => {
        if (env.valueFrom?.configMapKeyRef) {
          target = `name.CM.${env.valueFrom.configMapKeyRef.name}`;
        } else if (env.valueFrom?.secretKeyRef) {
          target = `name.SE.${env.valueFrom.secretKeyRef.name}`;
        }

        if (targetIdHash === target) {
          nodes = this.addResourceToNodes(podIdHash, includedIdLabels, nodes, opts);
        } else if (targetNameHash === target) {
          nodes = this.addResourceToNodes(podIdHash, includedIdLabels, nodes, opts);
        }
      });
    });

    return [nodes, opts.flat];
  }

  private getResourceRelatedResource(includedIdLabels, nodes: IRelatedResource, opts: any) {
    if (nodes.resourceType === 'PD') {
      const podIdHash = `id.${nodes.resourceType}.${nodes.resourceId}`;
      const pod = opts.hashedResource[podIdHash];

      (pod.resourceOwnerReferences || []).map((owner: any) => {
        const type = TYPE_PER_NAME[(owner.kind || '').toLowerCase()];
        const uid = owner.uid;
      });

      (pod.resourcePodVolume || []).forEach((volume: any) => {
        let target = '';

        if (volume.persistentVolumeClaim) {
          target = `name.PC.${volume.persistentVolumeClaim.claimName}`;
        } else if (volume.configMap) {
          target = `name.CM.${volume.configMap.name}`;
        } else if (volume.secret) {
          target = `name.SE.${volume.secret.secretName}`;
        }

        if (target) {
          nodes = this.addResourceToNodes(target, includedIdLabels, nodes, opts);
        }
      });

      (pod.resourcePodContainer || []).forEach((container: any) => {
        let target = '';
        (container.env || []).forEach((env: any) => {
          if (env.valueFrom?.configMapKeyRef) {
            target = `name.CM.${env.valueFrom.configMapKeyRef.name}`;
          } else if (env.valueFrom?.secretKeyRef) {
            target = `name.SE.${env.valueFrom.secretKeyRef.name}`;
          }

          if (target) {
            nodes = this.addResourceToNodes(target, includedIdLabels, nodes, opts);
          }
        });
      });
    }

    return nodes;
  }

  private addResourceToNodes(target: string, includedIdLabels, nodes, opts: any) {
    const { hashedResource } = opts;

    console.log('>>', target, includedIdLabels.indexOf(target) > -1, !hashedResource[target]);
    console.log('>>', Object.keys(hashedResource));

    if (includedIdLabels.indexOf(target) > -1 || !hashedResource[target]) {
      return nodes;
    }

    const resource = hashedResource[target];

    const { resourceKey, resourceId, resourceGroupKey, resourceType, resourceName } = resource;

    let newNodes: IRelatedResource = {
      resourceKey,
      resourceId,
      resourceGroupKey,
      resourceType,
      resourceName,
      relatedResources: [],
    };

    newNodes = this.getResourceRelatedResource(includedIdLabels, newNodes, opts);

    includedIdLabels.push(target);
    nodes.relatedResources.push(newNodes);
    opts.flat.push({
      resourceKey,
      resourceId,
      resourceGroupKey,
      resourceType,
      resourceName,
    });

    return nodes;
  }
}

export default TopologyService;
