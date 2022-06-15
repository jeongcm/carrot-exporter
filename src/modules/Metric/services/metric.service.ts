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
  resourceId: string;
  start?: string;
  end?: string;
  step?: number;
  resourceGroupUuid?: string;
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

          let resource: IResource = null;
          let resourceGroup: IResourceGroup = null;
          if (resourceId) {
            resource = await this.resourceService.getUserResourceById(customerAccountKey, resourceId);

            if (!resource) {
              return this.throwError(`NOT_FOUND`, `No resource found with resourceId (${resourceId})`);
            }

            resourceGroup = await this.resourceGroupService.getUserResourceGroupByKey(customerAccountKey, resource.resourceGroupKey);

            if (!resourceGroup) {
              return this.throwError('EXCEPTION', `No access to resourceGroupUuid(${resourceGroupUuid})`);
            }
          }

          const promQl = this.getPromQlFromQuery(query, resource, resourceGroup);

          if (!promQl.promQl) {
            return this.throwError(`EXCEPTION`, `Invalid type ${type}`);
          }

          if (promQl.ranged) {
            if (isEmpty(start) || isEmpty(end)) {
              return this.throwError('EXCEPTION', 'start and end required for ranged query');
            }
          }

          try {
            let data: any = null;

            if (start && end) {
              data = await this.victoriaMetricService.queryRange(`${promQl.promQl}`, `${start}`, `${end}`, step);
            } else {
              data = await this.victoriaMetricService.query(`${promQl.promQl}`);
            }

            results[name] = {
              ok: true,
              data,
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

  private getPromQlFromQuery(query: IMetricQueryBodyQuery, resource?: IResource, resourceGroup?: IResourceGroup) {
    const { type } = query;
    const clusterUuid = resourceGroup.resourceGroupUuid;
    let labelString = '';
    let ranged = false;

    let promQl = '';
    switch (type) {
      case 'NODE_CPU_PERCENTAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });
        ranged = true;

        promQl = `(
          (1 - sum without (mode) (rate(node_cpu_seconds_total{job="node-exporter", mode=~"idle|iowait|steal", __LABEL_PLACE_HOLDER__}[5m])))
        / ignoring(cpu) group_left
          count without (cpu, mode) (node_cpu_seconds_total{job="node-exporter", mode="idle", __LABEL_PLACE_HOLDER__})
        )`;
        break;
      case 'NODE_MEMORY_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });
        ranged = true;

        promQl = `(
          node_memory_MemTotal_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_MemFree_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_Buffers_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_Cached_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
        )`;
        break;
      case 'NODE_FILESYSTEM_USED':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });
        ranged = true;

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
        ranged = true;

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
        ranged = true;

        promQl = `rate(node_network_receive_bytes_total{job="node-exporter", device!="lo", __LABEL_PLACE_HOLDER__}[5m])`;
        break;
      case 'NODE_NETWORK_TRAFFIC_TX':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });
        ranged = true;

        promQl = `rate(node_network_transmit_bytes_total{job="node-exporter", device!="lo", __LABEL_PLACE_HOLDER__}[5m])`;
        break;
      case 'POD_CPU':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
          namespace: resource.resourceNamespace,
        });
        ranged = true;

        promQl = `sum by(pod) (rate(container_cpu_usage_seconds_total{image!="",container=~".*", __LABEL_PLACE_HOLDER__}[5m] ) )`;
        break;
      case 'POD_MEMORY':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resource.resourceName,
          namespace: resource.resourceNamespace,
        });
        ranged = true;

        promQl = `sum by(pod) (container_memory_working_set_bytes{container=~".*",container!="",container!="POD", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'POD_NETWORK_RX':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });
        ranged = true;

        promQl = `sort_desc(sum by (pod) (rate (container_network_receive_bytes_total{container=~".*",__LABEL_PLACE_HOLDER__}[5m])))`;
        break;
      case 'POD_NETWORK_TX':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resource.resourceName,
        });
        ranged = true;

        promQl = `sort_desc(sum by (pod) (rate (container_network_transmit_bytes_total{container=~".*",__LABEL_PLACE_HOLDER__}[5m])))`;
        break;
      case 'NS_container_network_receive_bytes_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceName,
        });

        promQl = `sum(irate(container_network_receive_bytes_total{__LABEL_PLACE_HOLDER__}[4h:5m])) by (pod)`;
        break;
      case 'NS_container_network_transmit_bytes_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceName,
        });

        promQl = `sum(irate(container_network_transmit_bytes_total{__LABEL_PLACE_HOLDER__}[4h:5m])) by (pod)`;
        break;
      case 'NS_container_network_receive_packets_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceName,
        });

        promQl = `sum(irate(container_network_receive_packets_total{__LABEL_PLACE_HOLDER__}[4h:5m])) by (pod)`;
        break;
      case 'NS_container_network_transmit_packets_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceName,
        });

        promQl = `sum(irate(container_network_transmit_packets_total{__LABEL_PLACE_HOLDER__}[4h:5m])) by (pod)`;
        break;
      case 'NS_container_network_receive_packets_dropped_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceName,
        });

        promQl = `sum(irate(container_network_receive_packets_dropped_total{__LABEL_PLACE_HOLDER__}[4h:5m])) by (pod)`;
        break;
      case 'NS_container_network_transmit_packets_dropped_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceName,
        });

        promQl = `sum(irate(container_network_transmit_packets_dropped_total{__LABEL_PLACE_HOLDER__}[4h:5m])) by (pod)`;
        break;
      case 'NS_RUNNING_PVCS_USED_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace,
        });
        ranged = true;
        promQl = `(max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__}))`;
        break;
      case 'NS_PVCS_FULL_IN_2DAYS':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace,
        });
        promQl = `(
          count (
            (kubelet_volume_stats_available_bytes{__LABEL_PLACE_HOLDER__})
            and
            (predict_linear(kubelet_volume_stats_available_bytes{__LABEL_PLACE_HOLDER__}[1d], 2 * 24 * 60 * 60) < 0)
          )
        )
        or
        vector(0)`;
        break;
      case 'NS_PVCS_FULL_IN_5DAYS':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace,
        });
        promQl = `(
          count (
            (kubelet_volume_stats_available_bytes{__LABEL_PLACE_HOLDER__})
            and
            (predict_linear(kubelet_volume_stats_available_bytes{__LABEL_PLACE_HOLDER__}[1d], 5 * 24 * 60 * 60) < 0)
          )
        )
        or
        vector(0)`;
        break;
      case 'NS_PVCS_FULL_IN_WEEK':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace,
        });
        promQl = `(
          count (
            (kubelet_volume_stats_available_bytes{__LABEL_PLACE_HOLDER__})
            and
            (predict_linear(kubelet_volume_stats_available_bytes{__LABEL_PLACE_HOLDER__}[1d], 7 * 24 * 60 * 60) < 0)
          )
        )
        or
        vector(0)`;
        break;
      case 'NS_PVCS_ABOVE_WARNING_THRESHOLD':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace,
        });
        promQl = `count (max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__} ) and (max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__} )) / (max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_capacity_bytes{__LABEL_PLACE_HOLDER__} )) >= (80 / 100)) or vector (0)`;
        break;
      case 'NS_PVCS_IN_PENDING_STATE':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace,
        });
        promQl = `count((kube_persistentvolumeclaim_status_phase{__LABEL_PLACE_HOLDER__, phase="Pending"}==1)) or vector(0)`;
        break;
      case 'NS_PVCS_IN_LOST_STATE':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resource.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace,
        });
        promQl = `count((kube_persistentvolumeclaim_status_phase{__LABEL_PLACE_HOLDER__, phase="Lost"}==1)) or vector(0)`;
        break;
    }

    promQl = promQl.replace(/__LABEL_PLACE_HOLDER__/g, labelString);

    return {
      promQl,
      ranged,
    };
  }
}

export default MetricService;
