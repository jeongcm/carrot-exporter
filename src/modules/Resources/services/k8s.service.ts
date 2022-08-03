import DB from '@/database';
import { IResource, IK8sResourceRelationNode } from '@/common/interfaces/resource.interface';
import ServiceExtension from '@/common/extentions/service.extension';
import sizeToBytes from 'common/utils/sizeToBytes';

const RESOURCE_TYPES = ['K8', 'ND', 'SV', 'PD', 'PV'];

class k8sService extends ServiceExtension {
  public resource = DB.Resource;
  public resourceGroup = DB.ResourceGroup;

  constructor() {
    super({
      tableName: '',
    });
  }

  async getClusterDetail(resourceGroupKey: number, customerAccountKey: number) {
    const allResource: IResource[] = await this.resource.findAll({
      where: { deletedAt: null, resourceType: RESOURCE_TYPES, resourceGroupKey, customerAccountKey },
      attributes: { exclude: ['deletedAt'] },
    });

    const detail: any = {
      totalServices: 0,
      totalNodes: 0,
      totalPods: 0,
      podStatus: {},
      pv: {
        totalSize: 0,
        bound: 0,
        unbound: 0,
      },
      allocatable: {
        totalCpu: 0,
        ephemeralStorage: 0,
        memory: 0,
        pods: 0,
      },
    };

    (allResource || []).forEach((resource: IResource) => {
      switch (resource.resourceType) {
        case 'SV':
          this.processK8sDetailServices(detail, resource);
          break;
        case 'ND':
          this.processK8sDetailNodes(detail, resource);
          break;
        case 'PD':
          this.processK8sDetailPods(detail, resource);
          break;
        case 'PV':
          this.processK8sDetailPv(detail, resource);
          break;
      }
    });

    return detail;
  }

  public async getResourceRelationByKey(resourceKey: number, customerAccountKey: number) {

  }

  private processK8sDetailServices(detail: any, resource: IResource) {
    detail.totalServices += 1;
  }

  private processK8sDetailPv(detail: any, resource: IResource) {
    const pvSize = sizeToBytes(resource.resourceSpec?.capacity?.storage);
    detail.pv.totalSize += pvSize;

    switch (resource.resourceStatus?.phase) {
      case 'Bound':
        detail.pv.bound += pvSize;
        break;
      case 'Unbound':
        detail.pv.unbound += pvSize;
        break;
    }
  }

  private processK8sDetailPods(detail: any, resource: IResource) {
    detail.totalPods += 1;

    const phase = resource.resourceStatus?.phase;

    if (phase) {
      const phaseLowerCase = phase.toLowerCase();
      if (!detail.podStatus[phaseLowerCase]) {
        detail.podStatus[phaseLowerCase] = 0;
      }

      detail.podStatus[phaseLowerCase] += 1;
    }
  }

  private processK8sDetailNodes(detail: any, resource: IResource) {
    detail.totalNodes += 1;

    const resourceStatus = resource?.resourceStatus;

    if (resourceStatus) {
      detail.allocatable.totalCpu += parseInt(resourceStatus?.capacity?.cpu || 0);

      const ephemeralStorage = resourceStatus?.allocatable?.['ephemeral-storage'];
      if (ephemeralStorage) {
        detail.allocatable.ephemeralStorage += sizeToBytes(ephemeralStorage);
      }

      const memory = resourceStatus?.allocatable?.memory;
      if (memory) {
        detail.allocatable.memory += sizeToBytes(memory);
      }

      detail.allocatable.pods += parseInt(resourceStatus?.allocatable?.pods || 0);

      if (!detail.conditions) {
        detail.conditions = {};
      }

      (resourceStatus.conditions || []).map((condition: any)=>{
        const type = condition?.type;

        if (!detail.conditions[type]) {
          detail.conditions[type] = {
            total: 0,
            value: 0,
          };
        }
        detail.conditions[type].total += 1;

        if (condition?.status === 'True') {
          detail.conditions[type].value += 1;
        }
      });
    }
  }

}

export default k8sService;
