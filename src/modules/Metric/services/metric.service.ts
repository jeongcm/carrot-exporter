import ServiceExtension from '@/common/extentions/service.extension';
import { isEmpty } from 'lodash';
import VictoriaMetricService from './victoriaMetric.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import { ICustomerAccount } from 'common/interfaces/customerAccount.interface';
import { IResourceGroup, IResourceGroupUi } from 'common/interfaces/resourceGroup.interface';
import { IResource } from 'common/interfaces/resource.interface';
import getSelectorLabels from 'common/utils/getSelectorLabels';
import P8sService from "@modules/Metric/services/p8sService";
import config from 'config';
import DB from 'database';

export interface IMetricQueryBodyQuery {
  name: string;
  type: string;
  nodename?: string;
  resourceId?: string | string[];
  start?: string;
  end?: string;
  step?: string;
  promql?: string;
  resourceGroupId?: string | string[];
  resourceGroupUuid?: string;
  promqlOps?: {
    topk?: number;
    sort?: 'asc' | 'desc';
    ranged?: boolean;
  };
}

export interface IMetricQueryBody {
  query: IMetricQueryBodyQuery[];
}

class MetricService extends ServiceExtension {
  private resource = DB.Resource
  private resourceGroup = DB.ResourceGroup
  private telemetryService = null
  private victoriaMetricService = new VictoriaMetricService();
  private resourceGroupService = new ResourceGroupService();
  private customerAccountService = new CustomerAccountService();

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
          const { name, start, end, step, resourceGroupUuid, resourceId, resourceGroupId, type } = query;

          if (isEmpty(type)) {
            return this.throwError('EXCEPTION', `type for '${name}' is missing`);
          }
          const customerAccountId = await this.customerAccountService.getCustomerAccountIdByKey(customerAccountKey);
          let resources: IResource[] = null;
          let resourceGroups: IResourceGroupUi[] = null;
          if (resourceId) {
            let idsToUse: string[] = [];
            if (Array.isArray(resourceId)) {
              idsToUse = resourceId;
            } else {
              idsToUse = [resourceId];
            }
            resources = await this.resource.findAll({
              where: { resourceId: idsToUse, customerAccountKey },
              attributes: { exclude: ['deletedAt'] },
            });
            if (!resources || resources.length === 0) {
              return this.throwError(`NOT_FOUND`, `No resource found with resourceId (${resourceId})`);
            }

            const resourceGroupKeys = resources?.map((resource: IResource) => resource.resourceGroupKey);

            resourceGroups = await this.resourceGroupService.getUserResourceGroupByKeys(customerAccountKey, resourceGroupKeys);

            if (!resourceGroups || resourceGroups.length === 0) {
              return this.throwError('EXCEPTION', `No access to resourceGroups (accessed through resourceId)`);
            }
          } else if (resourceGroupUuid) {
            const resourceGroup = await this.resourceGroupService.getUserResourceGroupByUuid(customerAccountKey, resourceGroupUuid);
            if (!resourceGroup) {
              return this.throwError('EXCEPTION', `No access to resourceGroupUuid(${resourceGroupUuid})`);
            }
            resourceGroups = [resourceGroup];
          } else if (resourceGroupId) {
            let idsToUse: string[] = [];
            if (Array.isArray(resourceGroupId)) {
              idsToUse = resourceGroupId;
            } else {
              idsToUse = [resourceGroupId];
            }
            resourceGroups = await this.resourceGroupService.getResourceGroupByIds(idsToUse);
            if (!resourceGroups) {
              return this.throwError('EXCEPTION', `No access to resourceGroupUuid(${idsToUse.join(', ')})`);
            }
          }

          if (!resourceGroups && !resources) {
            return this.throwError(
              'NOT_FOUND',
              `no resourceGroup nor resource found! Please make sure to pass resourceGroupId or resourceGroupUuid or resourceId`,
            );
          }

          const promQl = this.getPromQlFromQuery(query, resources, resourceGroups);

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
              data = await this.victoriaMetricService.queryRange(customerAccountId, `${promQl.promQl}`, `${start}`, `${end}`, step);
            } else {
              data = await this.victoriaMetricService.query(customerAccountId, `${promQl.promQl}`, step);
            }

            results[name] = {
              ok: true,
              data,
              query: { ...promQl, step },
            };
          } catch (e) {
            results[name] = {
              ok: false,
              reason: e,
              query: { ...promQl, step },
            };
          }
        }),
      );
    } catch (e) {
      return this.throwError('EXCEPTION', e);
    }

    const resultInOrder = {};

    queryBody.query.forEach((query: IMetricQueryBodyQuery) => {
      const { name } = query;
      resultInOrder[name] = results[name];
    });

    return resultInOrder;
  }

  //TODO: 추후 getMetric 으로 통합될때 Metric api의 endpoint에 Cluster_Type(OS or K8S)로 구분하여 telemetry service가 뭐로 정해질지 구분해야합니다.
  public async getMetricP8S(customerAccountKey: number, queryBody: IMetricQueryBody) {

    const results: any = {};
    if (isEmpty(queryBody?.query)) {
      return this.throwError('EXCEPTION', 'query[] is missing');
    }

    if (config.victoriaMetrics.vmOpenstackSwitch === "off") {
      this.telemetryService = new P8sService()
    } else {
      this.telemetryService = new VictoriaMetricService()
    }

    try {
      await Promise.all(
        queryBody.query.map(async (query: IMetricQueryBodyQuery) => {
          const { name, start, end, step, resourceGroupUuid, resourceId, resourceGroupId, type } = query;

          if (isEmpty(type)) {
            return this.throwError('EXCEPTION', `type for '${name}' is missing`);
          }
          const customerAccountId = await this.customerAccountService.getCustomerAccountIdByKey(customerAccountKey);
          let resources: IResource[] = null;
          let resourceGroups: IResourceGroupUi[] = null;
          if (resourceId) {
            let idsToUse: string[] = [];
            if (Array.isArray(resourceId)) {
              idsToUse = resourceId;
            } else {
              idsToUse = [resourceId];
            }

            resources = await this.resource.findAll({
              where: { resourceId: idsToUse, customerAccountKey },
              attributes: { exclude: ['deletedAt'] },
            });

            if (!resources || resources.length === 0) {
              return this.throwError(`NOT_FOUND`, `No resource found with resourceId (${resourceId})`);
            }

            const resourceGroupKeys = resources?.map((resource: IResource) => resource.resourceGroupKey);

            resourceGroups = await this.resourceGroupService.getUserResourceGroupByKeys(customerAccountKey, resourceGroupKeys);

            if (!resourceGroups || resourceGroups.length === 0) {
              return this.throwError('EXCEPTION', `No access to resourceGroups (accessed through resourceId)`);
            }
          } else if (resourceGroupUuid) {
            const resourceGroup = await this.resourceGroupService.getUserResourceGroupByUuid(customerAccountKey, resourceGroupUuid);
            if (!resourceGroup) {
              return this.throwError('EXCEPTION', `No access to resourceGroupUuid(${resourceGroupUuid})`);
            }
            resourceGroups = [resourceGroup];
          } else if (resourceGroupId) {
            let idsToUse: string[] = [];
            if (Array.isArray(resourceGroupId)) {
              idsToUse = resourceGroupId;
            } else {
              idsToUse = [resourceGroupId];
            }
            resourceGroups = await this.resourceGroupService.getResourceGroupByIds(idsToUse);
            if (!resourceGroups) {
              return this.throwError('EXCEPTION', `No access to resourceGroupUuid(${idsToUse.join(', ')})`);
            }
          }

          if (!resourceGroups && !resources) {
            return this.throwError(
              'NOT_FOUND',
              `no resourceGroup nor resource found! Please make sure to pass resourceGroupId or resourceGroupUuid or resourceId`,
            );
          }

          const promQl = this.getPromQlFromQuery(query, resources, resourceGroups);

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
              data = await this.telemetryService.queryRange(customerAccountId, `${promQl.promQl}`, `${start}`, `${end}`, step);
            } else {
              data = await this.telemetryService.query(customerAccountId, `${promQl.promQl}`, step);
            }

            results[name] = {
              ok: true,
              data,
              query: { ...promQl, step },
            };
          } catch (e) {
            results[name] = {
              ok: false,
              reason: e,
              query: { ...promQl, step },
            };
          }
        }),
      );
    } catch (e) {
      return this.throwError('EXCEPTION', e);
    }

    const resultInOrder = {};

    queryBody.query.forEach((query: IMetricQueryBodyQuery) => {
      const { name } = query;
      resultInOrder[name] = results[name];
    });

    return resultInOrder;
  }

  private getPromQlFromQuery(query: IMetricQueryBodyQuery, resources?: IResource[], resourceGroups?: IResourceGroupUi[]) {
    const { type, promql: customPromQl, start, end, step, nodename, promqlOps = {} } = query;
    const clusterUuid = resourceGroups?.map((resourceGroup: IResourceGroupUi) => resourceGroup.resourceGroupUuid);
    const resourceName = resources?.map((resource: IResource) => resource.resourceName);
    const resourceNamespace = resources?.map((resource: IResource) =>
      resource?.resourceType === 'NS' ? resource.resourceName : resource.resourceNamespace,
    );
    let labelString = '';
    let ranged = false;

    let promQl = '';
    switch (type) {
      case 'CUSTOM':
        if (start && end) {
          ranged = true;
        }

        if (customPromQl.indexOf(`sum(`) > -1 || customPromQl.indexOf('SUM(') > -1) {
          promQl = customPromQl.replace('sum(', `sum({clusterUuid="${clusterUuid}"} AND `).replace('SUM(', `SUM({clusterUuid="${clusterUuid}"} AND `);
        } else {
          promQl = `(${customPromQl}) AND {clusterUuid="${clusterUuid}"}`;
        }

        break;

      //K8s NODE
      case 'NODE_CPU_PERCENTAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = true;

        promQl = `avg(rate(node_cpu_seconds_total{job="node-exporter", mode=~"user|system|iowait", __LABEL_PLACE_HOLDER__}[${step}])) by (node, cpu)`;
        break;
      case 'NODE_CPU_PERCENTAGE_MOMENT':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = false;

        promQl = `avg(rate(node_cpu_seconds_total{job="node-exporter", mode=~"user|system|iowait", __LABEL_PLACE_HOLDER__}[${
          step || '5m'
        }])) by (node)`;
        break;
      case 'NODE_MEMORY_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = true;

        promQl = `(
          node_memory_MemTotal_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_MemFree_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_Buffers_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          - node_memory_Cached_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
        )`;
        break;
      case 'NODE_MEMORY_TOTAL_MOMENT':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = false;

        promQl = `(
            node_memory_MemTotal_bytes{job="node-exporter", __LABEL_PLACE_HOLDER__}
          )`;
        break;
      case 'NODE_MEMORY_USAGE_MOMENT':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = false;

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
          node: resourceName,
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
      case 'NODE_FILESYSTEM_USED_MOMENT':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = false;

        promQl = `
          sum by (node) (
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
          node: resourceName,
        });
        ranged = true;

        promQl = `
          sum (
            max by (device) (
              node_filesystem_avail_bytes{job="node-exporter", fstype!="", __LABEL_PLACE_HOLDER__}
            )
          )
        `;
        break;
      case 'NODE_FILESYSTEM_AVAILABLE_MOMENT':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = false;

        promQl = `
          sum by (node) (
            max by (device, node) (
              node_filesystem_avail_bytes{job="node-exporter", fstype!="", __LABEL_PLACE_HOLDER__}
            )
          )
        `;
        break;
      case 'NODE_NETWORK_TRAFFIC_RX':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = true;

        promQl = `rate(node_network_receive_bytes_total{job="node-exporter", device!="lo", __LABEL_PLACE_HOLDER__}[${step}])`;
        break;
      case 'NODE_NETWORK_TRAFFIC_TX':
        labelString += getSelectorLabels({
          clusterUuid,
          node: resourceName,
        });
        ranged = true;

        promQl = `rate(node_network_transmit_bytes_total{job="node-exporter", device!="lo", __LABEL_PLACE_HOLDER__}[${step}])`;
        break;

      // K8s POD
      case 'POD_CPU_MOMENT_PER_CLUSTER':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        ranged = false;

        promQl = `sum by(pod, clusterUuid) (rate(container_cpu_usage_seconds_total{image!="",container=~".*", __LABEL_PLACE_HOLDER__}[${step}] ) )`;
        break;
      case 'POD_CPU':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
          namespace: resourceNamespace,
        });
        ranged = true;

        promQl = `sum by(pod, clusterUuid) (rate(container_cpu_usage_seconds_total{image!="",container=~".*", __LABEL_PLACE_HOLDER__}[${step}] ) )`;
        break;
      case 'POD_RESOURCE':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
          namespace: resourceNamespace,
        });
        ranged = false;

        promQl = `{__name__=~"kube_pod_container_resource_limits|kube_pod_container_resource_requests", __LABEL_PLACE_HOLDER__}`;
        break;
      case 'POD_MEMORY_MOMENT_PER_CLUSTER':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        ranged = false;

        promQl = `sum by(pod, clusterUuid) (container_memory_working_set_bytes{container=~".*",container!="",container!="POD", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'POD_MEMORY':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
          namespace: resourceNamespace,
        });
        ranged = true;

        promQl = `sum by(pod, clusterUuid) (container_memory_working_set_bytes{container=~".*",container!="",container!="POD", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'POD_CPU_MOMENT':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
          namespace: resourceNamespace,
        });
        ranged = false;

        promQl = `sum by(pod, clusterUuid) (rate(container_cpu_usage_seconds_total{image!="",container=~".*", __LABEL_PLACE_HOLDER__}[${step}] ) )`;
        break;
      case 'POD_MEMORY_MOMENT':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
          namespace: resourceNamespace,
        });
        ranged = false;

        promQl = `sum by(pod, clusterUuid) (container_memory_working_set_bytes{container=~".*",container!="",container!="POD", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'POD_CPU_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
          namespace: resourceNamespace,
        });
        ranged = false;

        promQl = `sort_desc(
            sum by(pod, clusterUuid) (rate(container_cpu_usage_seconds_total{image!="",container=~".*", __LABEL_PLACE_HOLDER__}[${step}] ) )
          )`;
        break;
      case 'POD_MEMORY_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
          namespace: resourceNamespace,
        });
        ranged = false;

        promQl = `sort_desc(sum by(pod, clusterUuid) (container_memory_working_set_bytes{container=~".*",container!="",container!="POD", __LABEL_PLACE_HOLDER__}))`;
        break;
      case 'POD_RXTX_TOTAL_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
          namespace: resourceNamespace,
        });

        ranged = false;

        promQl = `sort_desc(sum by (pod, clusterUuid) (rate(container_network_receive_bytes_total{id!="/", container=~".*",__LABEL_PLACE_HOLDER__}[5m]) + rate(container_network_transmit_bytes_total{id!="/",container=~".*",__LABEL_PLACE_HOLDER__}[5m])))`;
        break;
      case 'POD_RXTX_TOTAL':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
        });

        promQl = `sum by (pod, clusterUuid) (rate(container_network_receive_bytes_total{container=~".*",__LABEL_PLACE_HOLDER__}[60m]) + rate(container_network_transmit_bytes_total{container=~".*",__LABEL_PLACE_HOLDER__}[60m]))`;
        break;
      case 'POD_NETWORK_RX':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
        });
        ranged = true;

        promQl = `sort_desc(sum by (pod, clusterUuid) (rate (container_network_receive_bytes_total{container=~".*",__LABEL_PLACE_HOLDER__}[${step}])))`;
        break;
      case 'POD_NETWORK_TX':
        labelString += getSelectorLabels({
          clusterUuid,
          pod: resourceName,
        });
        ranged = true;

        promQl = `sort_desc(sum by (pod, clusterUuid) (rate (container_network_transmit_bytes_total{container=~".*",__LABEL_PLACE_HOLDER__}[${step}])))`;
        break;

      // K8s PV
      case 'K8S_CLUSTER_PV_CAPACITY':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
          persistentvolumeclaim: resourceName,
        });

        promQl = `sum by (persistentvolumeclaim) (kubelet_volume_stats_capacity_bytes{__LABEL_PLACE_HOLDER__}/1024/1024/1024)`;
        break;
      case 'K8S_CLUSTER_PV_USED':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
          persistentvolumeclaim: resourceName,
        });

        promQl = `sum by (persistentvolumeclaim) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__}/1024/1024/1024)`;
        break;
      case 'PV_SPACE_USAGE_CAPACITY':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
          persistentvolumeclaim: resourceName,
        });
        ranged = true;

        promQl = `(
          sum by (persistentvolumeclaim) (kubelet_volume_stats_capacity_bytes{__LABEL_PLACE_HOLDER__}/1024/1024/1024)
        )`;
        break;
      case 'PV_SPACE_USAGE_USED':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
          persistentvolumeclaim: resourceName,
        });
        ranged = true;

        promQl = `(
          sum by (persistentvolumeclaim) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__}/1024/1024/1024)
        )`;
        break;
      case 'K8S_CLUSTER_PV_AVAILABLE':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
          persistentvolumeclaim: resourceName,
        });

        promQl = `sum by (persistentvolumeclaim) (kubelet_volume_stats_available_bytes{__LABEL_PLACE_HOLDER__}/1024/1024/1024)`;
        break;
      case 'K8S_CLUSTER_PV_USAGE_PERCENTAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
          persistentvolumeclaim: resourceName,
        });

        promQl = `sum by (persistentvolumeclaim) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__}/kubelet_volume_stats_capacity_bytes{__LABEL_PLACE_HOLDER__} * 100)`;
        break;
      case 'PV_USAGE_USED':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
          persistentvolumeclaim: resourceName,
        });
        ranged = false;

        promQl = `(
          sum by (persistentvolumeclaim) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__}/1024/1024/1024)
        )`;
        break;
      case 'PV_USAGE_TOTAL':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
          persistentvolumeclaim: resourceName,
        });
        ranged = false;

        promQl = `(
          sum by (persistentvolumeclaim) (kubelet_volume_stats_capacity_bytes{__LABEL_PLACE_HOLDER__}/1024/1024/1024)
        )`;
        break;
      case 'PV_SPACE_USAGE_FREE':
        labelString += getSelectorLabels({
          clusterUuid,
          persistentvolumeclaim: resources?.map((resource: IResource) => resource.resourcePvClaimRef?.name),
          namespace: resources?.map((resource: IResource) => resource.resourcePvClaimRef?.namespace),
        });
        ranged = true;

        promQl = `sum without(instance, node) (topk(1, (kubelet_volume_stats_available_bytes{job="kubelet", metrics_path="/metrics", __LABEL_PLACE_HOLDER__})))`;
        break;
      case 'PVC_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc(sum by (persistentvolumeclaim, clusterUuid) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__}/kubelet_volume_stats_capacity_bytes{__LABEL_PLACE_HOLDER__} * 100))`;
        break;

      case 'K8S_CLUSTER_PV_USED_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `(max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__}))`;
        break;

      // K8s PD
      case 'PD_container_network_receive_bytes_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceName,
        });

        promQl = `sum(irate(container_network_receive_bytes_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (pod, clusterUuid)`;
        break;
      case 'PD_container_network_transmit_bytes_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceName,
        });

        promQl = `sum(irate(container_network_transmit_bytes_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (pod, clusterUuid)`;
        break;
      case 'PD_container_network_receive_packets_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceName,
        });

        promQl = `sum(irate(container_network_receive_packets_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (pod, clusterUuid)`;
        break;
      case 'PD_container_network_transmit_packets_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceName,
        });

        promQl = `sum(irate(container_network_transmit_packets_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (pod, clusterUuid)`;
        break;
      case 'PD_container_network_receive_packets_dropped_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceName,
        });

        promQl = `sum(irate(container_network_receive_packets_dropped_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (pod, clusterUuid)`;
        break;
      case 'PD_container_network_transmit_packets_dropped_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceName,
        });

        promQl = `sum(irate(container_network_transmit_packets_dropped_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (pod, clusterUuid)`;
        break;

      // K8s resource by NS
      case 'NS_container_network_receive_bytes_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceName,
        });

        promQl = `sum(irate(container_network_receive_bytes_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (namespace)`;
        break;
      case 'NS_container_network_transmit_bytes_total':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceName,
        });

        promQl = `sum(irate(container_network_transmit_bytes_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (namespace)`;
        break;
      case 'NS_container_network_receive_packets_total':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sum(irate(container_network_receive_packets_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (namespace)`;
        break;
      case 'NS_container_network_transmit_packets_total':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sum(irate(container_network_transmit_packets_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (namespace)`;
        break;
      case 'NS_container_network_receive_packets_dropped_total':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sum(irate(container_network_receive_packets_dropped_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (namespace)`;
        break;
      case 'NS_container_network_transmit_packets_dropped_total':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sum(irate(container_network_transmit_packets_dropped_total{__LABEL_PLACE_HOLDER__}[5h:5m])) by (namespace)`;
        break;

      case 'NS_RUNNING_PVCS_USED_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resourceNamespace,
        });
        ranged = true;
        promQl = `(max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__}))`;
        break;
      case 'NS_PVCS_FULL_IN_2DAYS':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resources?.map((resource: IResource) => (resource?.resourceType === 'NS' ? resource.resourceName : undefined)),
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
          namespace: resources?.map((resource: IResource) => (resource?.resourceType === 'NS' ? resource.resourceName : undefined)),
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
          namespace: resources?.map((resource: IResource) => (resource?.resourceType === 'NS' ? resource.resourceName : undefined)),
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
          namespace: resources?.map((resource: IResource) => (resource?.resourceType === 'NS' ? resource.resourceName : undefined)),
        });
        promQl = `count (max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__} ) and (max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_used_bytes{__LABEL_PLACE_HOLDER__} )) / (max by (persistentvolumeclaim,namespace) (kubelet_volume_stats_capacity_bytes{__LABEL_PLACE_HOLDER__} )) >= (80 / 100)) or vector (0)`;
        break;
      case 'NS_PVCS_IN_PENDING_STATE':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resources?.map((resource: IResource) => (resource?.resourceType === 'NS' ? resource.resourceName : undefined)),
        });
        promQl = `count((kube_persistentvolumeclaim_status_phase{__LABEL_PLACE_HOLDER__, phase="Pending"}==1)) or vector(0)`;
        break;
      case 'NS_PVCS_IN_LOST_STATE':
        labelString += getSelectorLabels({
          clusterUuid,
          namespace: resources?.map((resource: IResource) => (resource?.resourceType === 'NS' ? resource.resourceName : undefined)),
        });
        promQl = `count((kube_persistentvolumeclaim_status_phase{__LABEL_PLACE_HOLDER__, phase="Lost"}==1)) or vector(0)`;
        break;

      // K8s Cluster Node Metric
      case 'K8S_CLUSTER_NODE_MEMORY':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `(1 - (node_memory_MemAvailable_bytes{__LABEL_PLACE_HOLDER__} / (node_memory_MemTotal_bytes{__LABEL_PLACE_HOLDER__}))) * 100`;
        break;
      case 'K8S_CLUSTER_NODE_CPU':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `avg(rate(node_cpu_seconds_total{job="node-exporter", mode=~"user|system|iowait", __LABEL_PLACE_HOLDER__}[1m])) by (node) * 100`;
        break;
      case 'K8S_CLUSTER_NODE_DISK':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `(node_filesystem_size_bytes{__LABEL_PLACE_HOLDER__,fstype=~"ext.*|xfs",mountpoint="/"} - node_filesystem_free_bytes{__LABEL_PLACE_HOLDER__, fstype=~"ext.*|xfs",mountpoint="/"}) * 100
/ (node_filesystem_avail_bytes{__LABEL_PLACE_HOLDER__, fstype=~"ext.*|xfs",mountpoint="/"} + (node_filesystem_size_bytes{__LABEL_PLACE_HOLDER__, job="node-exporter", fstype=~"ext.*|xfs",mountpoint="/"} - node_filesystem_free_bytes{__LABEL_PLACE_HOLDER__, fstype=~"ext.*|xfs",mountpoint="/"}))`;
        break;
      case 'K8S_CLUSTER_NODE_RXTX_TOTAL':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (node) (rate(node_network_receive_bytes_total{__LABEL_PLACE_HOLDER__}[60m]) + rate(node_network_transmit_bytes_total{__LABEL_PLACE_HOLDER__}[60m]))`;
        break;

      // K8s Node Ranking
      case 'K8S_CLUSTER_NODE_MEMORY_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sort_desc(
          (1 - (node_memory_MemAvailable_bytes{__LABEL_PLACE_HOLDER__} / (node_memory_MemTotal_bytes{__LABEL_PLACE_HOLDER__})))* 100
        )`;
        break;
      case 'K8S_CLUSTER_NODE_CPU_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        /*
        promQl = `sort_desc(
          (1 - avg(rate(node_cpu_seconds_total{__LABEL_PLACE_HOLDER__,mode="idle"}[1m])) by (node)) * 100
        )`;*/
        promQl = `sort_desc(
          avg(rate(node_cpu_seconds_total{job="node-exporter", mode=~"user|system|iowait", __LABEL_PLACE_HOLDER__}[5m])) by (node, clusterUuid) * 100
        )`;
        break;
      case 'K8S_CLUSTER_NODE_DISK_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sort_desc(
(node_filesystem_size_bytes{__LABEL_PLACE_HOLDER__,fstype=~"ext.*|xfs",mountpoint="/"} - node_filesystem_free_bytes{__LABEL_PLACE_HOLDER__, fstype=~"ext.*|xfs",mountpoint="/"}) * 100
/ (node_filesystem_avail_bytes{__LABEL_PLACE_HOLDER__, fstype=~"ext.*|xfs",mountpoint="/"} + (node_filesystem_size_bytes{__LABEL_PLACE_HOLDER__, job="node-exporter", fstype=~"ext.*|xfs",mountpoint="/"} - node_filesystem_free_bytes{__LABEL_PLACE_HOLDER__, fstype=~"ext.*|xfs",mountpoint="/"}))
)`;
        break;
      case 'K8S_CLUSTER_NODE_RXTX_TOTAL_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sort_desc(
          sum by (node, clusterUuid) (rate(node_network_receive_bytes_total{__LABEL_PLACE_HOLDER__}[5m]) + rate(node_network_transmit_bytes_total{__LABEL_PLACE_HOLDER__}[5m]))
        )`;
        break;

      // promql for k8s overview
      case 'K8S_CLUSTER_CPU_UTILISATION':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `1 - avg(rate(node_cpu_seconds_total{mode="idle", __LABEL_PLACE_HOLDER__}[${step}]))`;
        break;
      case 'K8S_CLUSTER_CPU_REQUESTS_COMMITMENT':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum(cluster:namespace:pod_cpu:active:kube_pod_container_resource_requests{__LABEL_PLACE_HOLDER__}) / sum(kube_node_status_allocatable{resource="cpu", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_CPU_LIMITS_COMMITMENT':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum(cluster:namespace:pod_cpu:active:kube_pod_container_resource_limits{__LABEL_PLACE_HOLDER__}) / sum(kube_node_status_allocatable{resource="cpu", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_MEMORY_UTILISATION':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `1 - sum(node_memory_MemAvailable_bytes{__LABEL_PLACE_HOLDER__}) / sum(node_memory_MemTotal_bytes{__LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_MEMORY_REQUESTS_COMMITMENT':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum(cluster:namespace:pod_memory:active:kube_pod_container_resource_requests{__LABEL_PLACE_HOLDER__}) / sum(kube_node_status_allocatable{resource="memory", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_MEMORY_LIMITS_COMMITMENT':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum (cluster:namespace:pod_memory:active:kube_pod_container_resource_limits{__LABEL_PLACE_HOLDER__}) / sum(kube_node_status_allocatable{resource="memory", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_CPU_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `1 - avg by (namespace) (rate(node_cpu_seconds_total{mode="idle", __LABEL_PLACE_HOLDER__}[${step}]))`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_CPU_REQUESTS':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (cluster:namespace:pod_cpu:active:kube_pod_container_resource_requests{__LABEL_PLACE_HOLDER__}) / sum (kube_node_status_allocatable{resource="cpu", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_CPU_REQUESTS_PERCENTAGE':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (sum by(cluster, namespace, pod, container) (rate(container_cpu_usage_seconds_total{container!="POD",image!="",job="kubelet",metrics_path="/metrics/cadvisor", __LABEL_PLACE_HOLDER__}[${step}])) * on(cluster, namespace, pod) group_left(node) topk by(cluster, namespace, pod) (1, max by(cluster, namespace, pod, node) (kube_pod_info{node!="", __LABEL_PLACE_HOLDER__}))) / sum by (namespace) (cluster:namespace:pod_cpu:active:kube_pod_container_resource_requests{__LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_CPU_LIMITS':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (cluster:namespace:pod_cpu:active:kube_pod_container_resource_limits{__LABEL_PLACE_HOLDER__}) / sum (kube_node_status_allocatable{resource="cpu", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_CPU_LIMITS_PERCENTAGE':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (sum by(cluster, namespace, pod, container) (rate(container_cpu_usage_seconds_total{container!="POD",image!="",job="kubelet",metrics_path="/metrics/cadvisor", __LABEL_PLACE_HOLDER__}[${step}])) * on(cluster, namespace, pod) group_left(node) topk by(cluster, namespace, pod) (1, max by(cluster, namespace, pod, node) (kube_pod_info{node!="", __LABEL_PLACE_HOLDER__}))) / sum by (namespace) (cluster:namespace:pod_cpu:active:kube_pod_container_resource_limits{__LABEL_PLACE_HOLDER__})`;
        break;
      // it can be replaced with container_memory_working_set_bytes (it contains swap out memory)
      case 'K8S_CLUSTER_NAMESPACE_MEMORY_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (container_memory_rss{container!="", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_MEMORY_REQUESTS':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (cluster:namespace:pod_memory:active:kube_pod_container_resource_requests{__LABEL_PLACE_HOLDER__}) / sum (kube_node_status_allocatable{resource="memory", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_MEMORY_REQUESTS_PERCENTAGE':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (container_memory_rss{container!="", __LABEL_PLACE_HOLDER__})  / sum by (namespace) (cluster:namespace:pod_memory:active:kube_pod_container_resource_requests{__LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_MEMORY_LIMITS':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (cluster:namespace:pod_memory:active:kube_pod_container_resource_limits{__LABEL_PLACE_HOLDER__}) / sum (kube_node_status_allocatable{resource="memory", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'K8S_CLUSTER_NAMESPACE_MEMORY_LIMITS_PERCENTAGE':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `sum by (namespace) (container_memory_rss{container!="", __LABEL_PLACE_HOLDER__}) / sum by (namespace) (cluster:namespace:pod_memory:active:kube_pod_container_resource_limits{__LABEL_PLACE_HOLDER__})`;
        break;

      // promql for openstack
      // Openstack Service metrics
      case 'OS_CLUSTER_NOVA_AGENT_UP':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sum(last_over_time(openstack_nova_agent_state{adminState="enabled",__LABEL_PLACE_HOLDER__}[1h]))`;
        break;
      case 'OS_CLUSTER_NOVA_AGENT_DOWN':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `count(last_over_time(openstack_nova_agent_state{adminState="enabled", __LABEL_PLACE_HOLDER__}[1h])) -sum(last_over_time(openstack_nova_agent_state{adminState="enabled", __LABEL_PLACE_HOLDER__}[1h]))`;
        break;
      case 'OS_CLUSTER_CINDER_AGENT_UP':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sum(last_over_time(openstack_cinder_agent_state{adminState="enabled",__LABEL_PLACE_HOLDER__}[1h]))`;
        break;
      case 'OS_CLUSTER_CINDER_AGENT_DOWN':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `count(last_over_time(openstack_cinder_agent_state{adminState="enabled", __LABEL_PLACE_HOLDER__}[1h])) - sum(last_over_time(openstack_cinder_agent_state{adminState="enabled", __LABEL_PLACE_HOLDER__}[1h]))`;
        break;
      case 'OS_CLUSTER_NEUTRON_AGENT_UP':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sum(last_over_time(openstack_neutron_agent_state{adminState="up",__LABEL_PLACE_HOLDER__}[1h]))`;
        break;
      case 'OS_CLUSTER_NEUTRON_AGENT_DOWN':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `count(last_over_time(openstack_neutron_agent_state{adminState="up", __LABEL_PLACE_HOLDER__}[1h])) - sum(last_over_time(openstack_neutron_agent_state{adminState="up", __LABEL_PLACE_HOLDER__}[1h]))`;
        break;

      // Openstack PM Metrics
      case 'OS_CLUSTER_PM_TOTAL_CPU_COUNT':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        promQl = `count by (nodename) (nc:node_cpu_seconds_total{job=~"pm-node-exporter", is_ops_pm=~"Y", mode='system', __LABEL_PLACE_HOLDER__})`
        break;
      case 'OS_CLUSTER_PM_MEMORY_TOTAL_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        promQl = `sum by (nodename) (nc:node_memory_MemTotal_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__})`
        break;
      case 'OS_CLUSTER_PM_MEMORY_USED_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        promQl = `sum by (nodename)(nc:node_memory_MemTotal_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__} - nc:node_memory_MemAvailable_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__})`
        break;
      case 'OS_CLUSTER_PM_FILESYSTEM_TOTAL_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });
        promQl = `sum by (nodename) (avg(nc:node_filesystem_size_bytes{job=~"pm-node-exporter",fstype=~"xfs|ext.*", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__})by(device, nodename))`
        break;
      case 'OS_CLUSTER_PM_FILESYSTEM_USED_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        promQl = `sum by (nodename) (avg(nc:node_filesystem_size_bytes{job=~"pm-node-exporter",fstype=~"xfs|ext.*", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__})by(device, nodename)) - sum by (nodename) (avg(nc:node_filesystem_free_bytes{job=~"pm-node-exporter",fstype=~"xfs|ext.*", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__})by(device, nodename))`
        break;
      case 'OS_CLUSTER_PM_INFO':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `node_uname_info{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}`;
        break;
      case 'OS_CLUSTER_PM_NODE_UP_TIME':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });
        promQl = `sum by (nodename) (time() - nc:node_boot_time_seconds{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__})`;
        break;
      case 'OS_CLUSTER_PM_CPU_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        ranged = true;
        promQl = `100 - (avg by (nodename) (rate(nc:node_cpu_seconds_total{job=~"pm-node-exporter", is_ops_pm=~"Y", mode=~"idle", __LABEL_PLACE_HOLDER__}[${step}])) * 100)`
        break;
      case 'OS_CLUSTER_PM_MEMORY_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        promQl = `(sum by (nodename) (nc:node_memory_MemTotal_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__} - nc:node_memory_MemAvailable_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}) / sum by (nodename) (nc:node_memory_MemTotal_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}) ) * 100`
        break;
      case 'OS_CLUSTER_PM_FILESYSTEM_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        promQl = `(sum by (nodename) (avg(nc:node_filesystem_size_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))-sum by (nodename) (avg(nc:node_filesystem_free_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))) *100/(sum by (nodename) (avg(nc:node_filesystem_avail_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))+(sum by (nodename) (avg(nc:node_filesystem_size_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))-sum by (nodename) (avg(nc:node_filesystem_free_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))))`
        break;
      case 'OS_CLUSTER_PM_NETWORK_RECEIVED':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        ranged = true;
        promQl = `max(rate(nc:node_network_receive_bytes_total{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}[${step}])*8) by (nodename, clusterUuid)`
        break;
      case 'OS_CLUSTER_PM_NETWORK_TRANSMITTED':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resourceName,
        });

        ranged = true;
        promQl = `max(rate(nc:node_network_transmit_bytes_total{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}[${step}])*8) by (nodename, clusterUuid)`
        break;

      // Openstack VM Metrics
      case 'OS_CLUSTER_VM_TOTAL_CPU_COUNT':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"]),
        });

        promQl = `count by (nodename, clusterUuid) (nc:node_cpu_seconds_total{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", mode='system', __LABEL_PLACE_HOLDER__})`
        break;
      case 'OS_CLUSTER_VM_MEMORY_TOTAL_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"]),
        });

        promQl = `sum by (nodename, clusterUuid) (nc:node_memory_MemTotal_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__})`
        break;
      case 'OS_CLUSTER_VM_MEMORY_USED_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"]),
        });

        promQl = `sum by (nodename, clusterUuid) (nc:node_memory_MemTotal_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__} - nc:node_memory_MemAvailable_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__})`
        break;
      case 'OS_CLUSTER_VM_FILESYSTEM_TOTAL_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"]),
        });
        promQl = `sum by (nodename, clusterUuid) (avg(nc:node_filesystem_size_bytes{job=~"vm-node-exporter|collector-node-exporter",fstype=~"xfs|ext.*", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))`
        break;
      case 'OS_CLUSTER_VM_FILESYSTEM_USED_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        promQl = `sum by (nodename, clusterUuid) (avg(nc:node_filesystem_size_bytes{job=~"vm-node-exporter|collector-node-exporter",fstype=~"xfs|ext.*", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid)) - sum by (nodename, clusterUuid) (avg(nc:node_filesystem_free_bytes{job=~"vm-node-exporter|collector-node-exporter",fstype=~"xfs|ext.*", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))`
        break;
      case 'OS_CLUSTER_VM_CPU_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"]),
        });

        ranged = true;
        promQl = `100 - (avg by (nodename, clusterUuid) (rate(nc:node_cpu_seconds_total{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", mode=~"idle", __LABEL_PLACE_HOLDER__}[${step}])) * 100)`
        break;
      case 'OS_CLUSTER_VM_MEMORY_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"]),
        });

        promQl = `(sum by (nodename, clusterUuid) (nc:node_memory_MemTotal_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__} - nc:node_memory_MemAvailable_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}) / sum by (nodename, clusterUuid) (nc:node_memory_MemTotal_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}) ) * 100`
        break;
      case 'OS_CLUSTER_VM_FILESYSTEM_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"]),
        });

        promQl = `(sum by (nodename, clusterUuid) (avg(nc:node_filesystem_size_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))-sum by (nodename, clusterUuid) (avg(nc:node_filesystem_free_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))) *100/(sum by (nodename, clusterUuid) (avg(nc:node_filesystem_avail_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))+(sum by (nodename, clusterUuid) (avg(nc:node_filesystem_size_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))-sum by (nodename, clusterUuid) (avg(nc:node_filesystem_free_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))))`;
        break;
      case 'OS_CLUSTER_VM_NETWORK_RECEIVED':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        ranged = true;
        promQl = `max(rate(nc:node_network_receive_bytes_total{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}[${step}])*8) by (nodename, clusterUuid)`;
        break;
      case 'OS_CLUSTER_VM_NETWORK_TRANSMITTED':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        ranged = true;
        promQl = `max(rate(nc:node_network_transmit_bytes_total{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}[${step}])*8) by (nodename, clusterUuid)`;
        break;

      // Openstack PM ranking
      case 'OS_CLUSTER_PM_CPU_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc(100 - (avg by (nodename, clusterUuid) (rate(nc:node_cpu_seconds_total{job=~"pm-node-exporter", is_ops_pm=~"Y", mode=~"idle", __LABEL_PLACE_HOLDER__}[5m])) * 100))`
        break;
      case 'OS_CLUSTER_PM_MEMORY_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc((sum by (nodename, clusterUuid) (nc:node_memory_MemTotal_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__} - nc:node_memory_MemAvailable_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}) / sum by (nodename, clusterUuid) (nc:node_memory_MemTotal_bytes{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}) ) * 100)`
        break;
      case 'OS_CLUSTER_PM_DISK_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc((sum by (nodename, clusterUuid) (avg(nc:node_filesystem_size_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))-sum by (nodename, clusterUuid) (avg(nc:node_filesystem_free_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))) *100/(sum by (nodename, clusterUuid) (avg(nc:node_filesystem_avail_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))+(sum by (nodename, clusterUuid) (avg(nc:node_filesystem_size_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid))-sum by (nodename, clusterUuid) (avg(nc:node_filesystem_free_bytes{job=~"pm-node-exporter", is_ops_pm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename, clusterUuid)))))`
        break;
      case 'OS_CLUSTER_PM_RXTX_TOTAL_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc(sum by (nodename, clusterUuid) (increase(nc:node_network_receive_bytes_total{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}[30m])+ increase(nc:node_network_transmit_bytes_total{job=~"pm-node-exporter", is_ops_pm=~"Y", __LABEL_PLACE_HOLDER__}[30m])))`
        break;

      // Openstack VM ranking
      case 'OS_CLUSTER_VM_CPU_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc(100 - (avg by (nodename, clusterUuid) (rate(nc:node_cpu_seconds_total{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", mode=~"idle", __LABEL_PLACE_HOLDER__}[5m])) * 100))`
        break;
      case 'OS_CLUSTER_VM_MEMORY_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc((sum by (nodename, clusterUuid) (nc:node_memory_MemTotal_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__} - nc:node_memory_MemAvailable_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}) / sum by (nodename) (nc:node_memory_MemTotal_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}) ) * 100)`
        break;
      case 'OS_CLUSTER_VM_DISK_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc((sum by (nodename, clusterUuid) (avg(nc:node_filesystem_size_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))-sum by (nodename) (avg(nc:node_filesystem_free_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))) *100/(sum by (nodename) (avg(nc:node_filesystem_avail_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))+(sum by (nodename) (avg(nc:node_filesystem_size_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename))-sum by (nodename) (avg(nc:node_filesystem_free_bytes{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm="Y", fstype=~"xfs|ext.*", __LABEL_PLACE_HOLDER__})by(device, nodename)))))`
        break;
      case 'OS_CLUSTER_VM_RXTX_TOTAL_RANKING':
        labelString += getSelectorLabels({
          clusterUuid,
        });

        promQl = `sort_desc(sum by (nodename, clusterUuid) (increase(nc:node_network_receive_bytes_total{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}[30m])+ increase(nc:node_network_transmit_bytes_total{job=~"vm-node-exporter|collector-node-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}[30m])))`
        break;

      // Openstack VM process Metrics
      case 'OS_CLUSTER_VM_PROCESS_UP_TIME':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        promQl = `time() - (avg by (groupname) (nc:namedprocess_namegroup_oldest_start_time_seconds{job=~"vm-process-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__} > 0))`
        break;
      case 'OS_CLUSER_VM_PROCESS_COUNT':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        promQl = `nc:namedprocess_namegroup_num_procs{job=~"vm-process-exporter", is_ops_vm="Y", __LABEL_PLACE_HOLDER__}`
        break;
      case 'OS_CLUSTER_VM_PROCESS_FD_COUNT':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        promQl = `nc:namedprocess_namegroup_open_filedesc{job=~"vm-process-exporter", is_ops_vm="Y", __LABEL_PLACE_HOLDER__}`
        break;
      case 'OS_CLUSTER_VM_PROCESS_CPU_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        ranged = true;
        promQl = `rate(nc:namedprocess_namegroup_cpu_seconds_total{job="vm-process-exporter", is_ops_vm=~"Y", mode="system", __LABEL_PLACE_HOLDER__}[${step}])`
        break;
      case 'OS_CLUSTER_VM_PROCESS_MEMORY_USAGE':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        promQl = `nc:namedprocess_namegroup_memory_bytes{job="vm-process-exporter", is_ops_vm=~"Y", memtype="virtual", __LABEL_PLACE_HOLDER__}`
        break;
      case 'OS_CLUSTER_VM_PROCESS_FILESYSTEM_READ_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        ranged = true;
        promQl = `rate(nc:namedprocess_namegroup_read_bytes_total{job=~"vm-process-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}[${step}])`
        break;
      case 'OS_CLUSTER_VM_PROCESS_FILESYSTEM_WRITE_BYTES':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });

        ranged = true;
        promQl = `rate(nc:namedprocess_namegroup_write_bytes_total{job=~"vm-process-exporter", is_ops_vm=~"Y", __LABEL_PLACE_HOLDER__}[${step}])`
        break;

      // Openstack PM, VM Status
      case 'OS_CLUSTER_VM_NODE_STATUS':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename: resources?.map((resource: IResource) => resource.resourceSpec["OS-EXT-SRV-ATTR:hostname"])
        });
        promQl = `nc:probe_success{job=~"vm-blackbox-exporter-icmp", __LABEL_PLACE_HOLDER__}`;
        break;
      case 'OS_CLUSTER_PM_NODE_STATUS':
        labelString += getSelectorLabels({
          clusterUuid,
          nodename,
        });
        promQl = `nc:probe_success{job=~"pm-blackbox-exporter-icmp", __LABEL_PLACE_HOLDER__}`;
        break;
      case 'OS_CLUSTER_NODE_STATUS':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `{__name__="probe_success", job=~"pm-blackbox-exporter-icmp|vm-blackbox-exporter-icmp", __LABEL_PLACE_HOLDER__}`;
        break;
      case 'OS_CLUSTER_PM_VM_ALL_STATUS':
        labelString += getSelectorLabels({
          clusterUuid,
        });
        promQl = `{__name__=~"probe_success|nc:probe_success", __LABEL_PLACE_HOLDER__}`;
        break;
    }

    // Apply PromQL operators
    if (promqlOps?.sort) {
      promQl = `sort_${promqlOps.sort}(${promQl})`;
    }

    if (promqlOps?.topk) {
      promQl = `topk(${promqlOps.topk}, ${promQl})`;
    }

    if (typeof promqlOps?.ranged === 'boolean') {
      ranged = promqlOps?.ranged;
    }

    // Apply PromQL operators
    if (promqlOps?.sort === 'desc') {
      promQl = `sort_desc(${promQl})`;
    }

    if (promqlOps?.sort === 'asc') {
      promQl = `sort(${promQl})`;
    }

    if (promqlOps?.topk) {
      promQl = `topk(${promqlOps.topk}, ${promQl})`;
    }

    if (typeof promqlOps?.ranged === 'boolean') {
      ranged = promqlOps?.ranged;
    }

    promQl = promQl.replace(/__LABEL_PLACE_HOLDER__/g, labelString);
    console.log(promQl);

    return {
      promQl,
      ranged,
    };
  }
}

export default MetricService;
