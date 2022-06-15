import ServiceExtension from '@/common/extentions/service.extension';
import { isEmpty } from 'lodash';
import VictoriaMetricService from './victoriaMetric.service';
import ResourceService from '@/modules/Resources/services/resource.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import { IResourceGroup } from 'common/interfaces/resourceGroup.interface';
import { IResource } from 'common/interfaces/resource.interface';
import getSelectorLabels from 'common/utils/getSelectorLabels';

export interface IMetricQueryBodyQuery {
  name: string;
  type: string;
  start?: string;
  end?: string;
  step?: number;
  resourceGroupUuid: string;
  resourceId?: string;
}

export interface IMetricQueryBody {
  query: IMetricQueryBodyQuery[];
}

class MetricService extends ServiceExtension {
  private victoriaMetricService = new VictoriaMetricService();
  private resourceService = new ResourceService();
  private resourceGroupService = new ResourceGroupService();

  constructor() {
    super({});
  }

  public async getMetric(customerAccountKey: number, queryBody: IMetricQueryBody) {
    const results: any = {};

    if (isEmpty(queryBody?.query)) {
      return this.throwError('EXCEPTION', 'query[] is missing');
    }

    try {
      await Promise.all(
        queryBody.query.map(async (query: IMetricQueryBodyQuery) => {
          const { name, start, end, step, resourceGroupUuid, resourceId, type } = query;

          if (isEmpty(type)) {
            return this.throwError('EXCEPTION', `type for '${name}' is missing`);
          }

          if (isEmpty(resourceGroupUuid)) {
            return this.throwError('EXCEPTION', `resourceGroupUuid for '${name}' is missing`);
          }

          const resourceGroup: IResourceGroup = await this.resourceGroupService.getUserResourceGroupByUuid(customerAccountKey, resourceGroupUuid);

          if (!resourceGroup) {
            return this.throwError('EXCEPTION', `No access to resourceGroupUuid(${resourceGroupUuid})`);
          }

          let resource: IResource = null;
          if (resourceId) {
            resource = await this.resourceService.getUserResourceById(customerAccountKey, resourceId);

            if (!resource) {
              return this.throwError(`NOT_FOUND`, `No resource found with resourceId (${resourceId})`);
            }
          }

          const promQl = this.getPromQlFromQuery(query, resource, resourceGroup);

          if (!promQl) {
            return this.throwError(`EXCEPTION`, `Invalid type ${type}`);
          }

          try {
            results[name] = {
              ok: true,
              data: await this.victoriaMetricService.queryRange(`${promQl}`, `${start}`, `${end}`, step),
              promQl,
            };
          } catch (e) {
            results[name] = {
              ok: false,
              reason: e,
              promQl,
            };
          }
        }),
      );
    } catch (e) {
      return this.throwError('EXCEPTION', e);
    }

    return results;
  }

  private getPromQlFromQuery(query: IMetricQueryBodyQuery, resource?: IResource, resourceGroup?: IResourceGroup): string {
    const { type, resourceGroupUuid } = query;
    const clusterUuid = resourceGroupUuid;
    let labelString = '';

    let promQl = '';
    switch (type) {
      case 'NODE_CPU':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });

        promQl = `100 - (avg by (instance, node, clusterUuid) (irate(node_cpu_seconds_total{mode="idle", __LABEL_PLACE_HOLDER__}[5m])) * 100)`;
        break;
      case 'NODE_MEMORY_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });

        promQl = `(
          node_memory_MemTotal_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_MemFree_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_Buffers_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_Cached_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
        )`;
        break;
      case 'NODE_FILESYSTEM_AVAILABLE':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });

        promQl = `
          sum(
            max by (device) (
              node_filesystem_size_bytes{job="node-exporter", fstype!="", __LABEL_PLACE_HOLDER__}
            -
              node_filesystem_avail_bytes{job="node-exporter", fstype!="", __LABEL_PLACE_HOLDER__}
            )
          )
        `;
        break;
      case 'NODE_FILESYSTEM_AVAILABLE':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });

        promQl = `
          sum(
            max by (device) (
              node_filesystem_avail_bytes{job="node-exporter", fstype!="", __LABEL_PLACE_HOLDER__}
            )
          )
        `;
        break;
      case 'NODE_NETWORK_TRAFFIC_RX':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });

        promQl = `rate(node_network_receive_bytes_total{job="node-exporter", device!="lo", __LABEL_PLACE_HOLDER__}[5m])`;
        break;
      case 'NODE_NETWORK_TRAFFIC_TX':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });

        promQl = `rate(node_network_transmit_bytes_total{job="node-exporter", device!="lo", __LABEL_PLACE_HOLDER__}[5m])`;
        break;
      case 'POD_CPU':
        break;
      case 'POD_MEMORY':
        break;
      case 'POD_NETWORK':
        break;
      case 'VOLUME_USAGE':
        break;
      case 'NETWORK_RX':
        break;
      case 'NETWORK_TX':
        break;
    }
    promQl = promQl.replace(/__LABEL_PLACE_HOLDER__/g, labelString);

    return promQl;
  }
}

export default MetricService;
