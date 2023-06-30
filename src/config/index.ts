/*
How to add config:
1. define a config here using the right nested object
2. add the environment variable in .env.sample file
3. define the type of the environment variable in validateEnv, IF the variable is required
*/

import '../dotenvConfig';
import validateEnv from './validateEnv';
import * as process from "process";

validateEnv();

export default {
  appPort: process.env.CO_AGGREGATOR_PORT || 6001,
  appUrl: process.env.CO_AGGREGATOR_URL || 'http://localhost',
  nodeEnv: process.env.CO_AGGREGATOR_ENV || 'development',
  maxApiBodySize: process.env.CO_MAX_API_BODY_SIZE || '50mb',
  logFormat: process.env.CO_AGGREGATOR_LOG_FORMAT,
  coApi: {
    url: process.env.CO_API_URL || 'http://localhost',
    port: process.env.CO_API_PORT || 5001,
  },
  cors: {
    allowAnyOrigin:
      process.env.CO_AGGREGATOR_CORS_ORIGIN === 'true' ? Boolean(process.env.CO_AGGREGATOR_CORS_ORIGIN) : process.env.CO_AGGREGATOR_CORS_ORIGIN,
    credentials: process.env.CO_AGGREGATOR_CORS_CREDENTIALS === 'true',
  },
  db: {
    mariadb: {
      host: process.env.CO_AGGREGATOR_DB_CONFIG_HOST || 'olly-dev-db.claion.io',
      port: Number(process.env.CO_AGGREGATOR_DB_CONFIG_PORT) || 3306,
      user: process.env.CO_AGGREGATOR_DB_CONFIG_USER || 'root',
      password: process.env.CO_AGGREGATOR_DB_CONFIG_PASSWORD || 'gu7C89wD8X',
      dbName: process.env.CO_AGGREGATOR_DB_CONFIG_DB_NAME || 'nc_api',
      ncpDbName: process.env.CO_AGGREGATOR_DB_CONFIG_NCP_DB_NAME || 'ncp_api',
      poolMin: Number(process.env.CO_AGGREGATOR_DB_CONFIG_POOL_MIN) || 1,
      poolMax: Number(process.env.CO_AGGREGATOR_DB_CONFIG_POOL_MAX) || 5,
    },
  },

  logger: {
    silenceResponse: process.env.CO_AGGREGATOR_LOG_SILENCE_RESPONSE ? process.env.CO_AGGREGATOR_LOG_SILENCE_RESPONSE === 'true' : false,
  },

  victoriaMetrics: {
    CO_AGGREGATOR_VM_ADDRESS: process.env.CO_AGGREGATOR_VM_ADDRESS,
    CO_VM_SINGLE_ADDRESS: process.env.CO_VM_SINGLE_ADDRESS,
    CO_AGGREGATOR_VM_API: process.env.CO_AGGREGATOR_VM_API,
    vmSingleUrl: process.env.CO_AGGREGATOR_VM_SINGLE_ADDRESS || 'http://olly-dev-vm.claion.io:8428',
    vmMultiUrl: process.env.CO_AGGREGATOR_VM_MULTI_ADDRESS || 'http://olly-dev-vmauth.claion.io:8427',
    vmImport: process.env.CO_AGGREGATOR_VM_IMPORT || '/api/v1/import?extra_label=clusterUuid=',
    vmMultiBaseUrlInsert:
      process.env.CO_VM_MULTI_BASE_URL_INSERT || 'http://vm-cluster-victoria-metrics-cluster-vminsert.vm-multi-tenant.svc.cluster.local:8480/insert',
    vmMultiBaseUrlSelect:
      process.env.CO_VM_MULTI_BASE_URL_SELECT || 'http://vm-cluster-victoria-metrics-cluster-vmselect.vm-multi-tenant.svc.cluster.local:8481/select',
    vmMultiAuthUrl: process.env.CO_VM_MULTI_AUTH_URL || 'http://vm-auth-victoria-metrics-auth.vm-multi-tenant.svc.cluster.local:8427',
    vmMultiNamespaces: process.env.CO_VM_MULTI_NAMESPACE || 'vm-multi-tenant',
    vmMultiSecret: process.env.CO_VM_MULTI_SECRET || 'vm-auth-victoria-metrics-auth',
    vmMultiClusterUuid: process.env.CO_VM_MULTI_CLUSTER_UUID,
    vmOption: process.env.CO_AGGREGATOR_VM_OPTION || 'SINGLE',
    vmOpenstackSwitch: process.env.CO_VM_OPENSTACK_SWITCH || 'off',
  },

  obsUrl: {
    kpsNamespace: process.env.CO_KPS_NAMESPACE || 'monitor',
    prometheusUrlHead: process.env.CO_PROMETHEUS_URL_HEAD || 'http://kps-kube-prometheus-stack-prometheus.',
    prometheusUrlTail: process.env.CO_PROMETHEUS_URL_TAIL || '.svc.cluster.local:9090',
    nodeExporterPort: process.env.NODE_EXPORTER_PORT || 9100,
  },
  oT: {
    oTTraceLogTurnOff: process.env.CO_TURN_OFF_TELEMETRY,
  },

  partyUser: {
    userId: process.env.CO_AGGREGATOR_SYSTEM_PARTYUSER_USERID || 'system@claion.io',
  },

  alert: {
    alertExpiredDate: process.env.CO_ALERT_EXPIRED_DATE || 60 * 60 * 24 // 1d
  }
};
