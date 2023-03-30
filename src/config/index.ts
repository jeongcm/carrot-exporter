/*
How to add config:
1. define a config here using the right nested object
2. add the environment variable in .env.sample file
3. define the type of the environment variable in validateEnv, IF the variable is required
*/

import '../dotenvConfig';
import validateEnv from './validateEnv';

validateEnv();

export default {
  appPort: process.env.AGGREGATOR_PORT || 7001,
  metricPort: process.env.NC_API_METRIC_PORT || 5002,
  appUrl: process.env.NC_LARI_URL || 'http://localhost',
  nodeEnv: process.env.NC_LARI_ENV || 'development',
  maxApiBodySize: process.env.NC_MAX_API_BODY_SIZE || '50mb',
  logFormat: process.env.NC_LARI_LOG_FORMAT,
  cors: {
    allowAnyOrigin: process.env.NC_LARI_CORS_ORIGIN === 'true' ? Boolean(process.env.NC_LARI_CORS_ORIGIN) : process.env.NC_LARI_CORS_ORIGIN,
    credentials: process.env.NC_LARI_CORS_CREDENTIALS === 'true',
  },
  db: {
    mariadb: {
      host: process.env.NC_LARI_DB_CONFIG_HOST,
      port: Number(process.env.NC_LARI_DB_CONFIG_PORT),
      user: process.env.NC_LARI_DB_CONFIG_USER,
      password: process.env.NC_LARI_DB_CONFIG_PASSWORD,
      dbName: process.env.NC_LARI_DB_CONFIG_DB_NAME,
      poolMin: Number(process.env.NC_LARI_DB_CONFIG_POOL_MIN),
      poolMax: Number(process.env.NC_LARI_DB_CONFIG_POOL_MAX),
    },
    mongodb: {
      url: process.env.NC_LARI_MONGO_URL,
    },
  },

  rabbitmq: {
    host: process.env.RABBITMQ_PROTOCOL_HOST || "amqp://",
    url: process.env.RABBITMQ_SERVER_URL || "localhost",
    port: process.env.RABBITMQ_SERVER_PORT || 5672,
    user: process.env.RABBITMQ_SERVER_USER || "user",
    password: process.env.RABBITMQ_SERVER_PASSWORD || "cwlO0jDx99Io9fZQ",
    vhost: process.env.RABBITMQ_SERVER_VIRTUAL_HOST || "/",
    alert: process.env.RABBITMQ_SERVER_QUEUE_ALERT || "co_alert",
    resource: process.env.RABBITMQ_SERVER_QUEUE_METRIC || "co_metric",
    metric: process.env.RABBITMQ_SERVER_QUEUE_METRIC_RECEIVED || "co_metric_received",
  },

  logger: {
    silenceResponse: process.env.NC_LARI_LOG_SILENCE_RESPONSE ? process.env.NC_LARI_LOG_SILENCE_RESPONSE === 'true' : false,
  },

  victoriaMetrics: {
    NC_LARI_VM_ADDRESS: process.env.NC_LARI_VM_ADDRESS,
    NC_VM_SINGLE_ADDRESS: process.env.NC_VM_SINGLE_ADDRESS,
    NC_LARI_VM_API: process.env.NC_LARI_VM_API,
    vmMultiBaseUrlInsert:
      process.env.NC_VM_MULTI_BASE_URL_INSERT || 'http://vm-cluster-victoria-metrics-cluster-vminsert.vm-multi-tenant.svc.cluster.local:8480/insert',
    vmMultiBaseUrlSelect:
      process.env.NC_VM_MULTI_BASE_URL_SELECT || 'http://vm-cluster-victoria-metrics-cluster-vmselect.vm-multi-tenant.svc.cluster.local:8481/select',
    vmMultiAuthUrl: process.env.NC_VM_MULTI_AUTH_URL || 'http://vm-auth-victoria-metrics-auth..vm-multi-tenant.svc.cluster.local:8427',
    vmMultiNamespaces: process.env.NC_VM_MULTI_NAMESPACE || 'vm-multi-tenant',
    vmMultiSecret: process.env.NC_VM_MULTI_SECRET || 'vm-auth-victoria-metrics-auth',
    vmMultiClusterUuid: process.env.NC_VM_MULTI_CLUSTER_UUID,
    vmOption: process.env.NC_VM_OPTION || 'MULTI',
    vmOpenstackSwitch: process.env.NC_VM_OPENSTACK_SWITCH || 'off',
  },

  obsUrl: {
    kpsNamespace: process.env.NC_KPS_NAMESPACE || 'monitor',
    prometheusUrlHead: process.env.NC_PROMETHEUS_URL_HEAD || 'http://kps-kube-prometheus-stack-prometheus.',
    prometheusUrlTail: process.env.NC_PROMETHEUS_URL_TAIL || '.svc.cluster.local:9090',
    grafanaUrlHead: process.env.NC_GRAFANA_URL_HEAD || 'http://kps-grafana.',
    grafanaUrlTail: process.env.NC_GRAFANA_URL_TAIL || '.svc.cluster.local:80',
    alertManagerUrlHead: process.env.NC_ALERTMANAGER_URL_HEAD || 'http://kps-kube-prometheus-stack-alertmanager.',
    alertManagerUrlTail: process.env.NC_ALERTMANAGER_URL_TAIL || '.svc.cluster.local:9093',
    lokiUrlHead: process.env.NC_LOKI_URL_HEAD || 'http://loki.',
    lokiUrlTail: process.env.NC_LOKI_URL_TAIL || '.svc.cluster.local:3100',
  },
  oT: {
    oTTraceLogTurnOff: process.env.NC_TURN_OFF_TELEMETRY,
  },

};
