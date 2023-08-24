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
  appPort: process.env.CM_EXPORTER_PORT || 6001,
  appUrl: process.env.CM_EXPORTER_URL || 'http://localhost',
  nodeEnv: process.env.CM_EXPORTER_ENV || 'development',
  maxApiBodySize: process.env.CO_MAX_API_BODY_SIZE || '50mb',
  logFormat: process.env.CM_EXPORTER_LOG_FORMAT,
  coApi: {
    url: process.env.API_URL || 'http://localhost',
    port: process.env.API_PORT || 5001,
  },
  cors: {
    allowAnyOrigin:
      process.env.CM_EXPORTER_CORS_ORIGIN === 'true' ? Boolean(process.env.CM_EXPORTER_CORS_ORIGIN) : process.env.CM_EXPORTER_CORS_ORIGIN,
    credentials: process.env.CM_EXPORTER_CORS_CREDENTIALS === 'true',
  },
  db: {
    mariadb: {
      host: process.env.CM_EXPORTER_DB_CONFIG_HOST || 'http://localhost',
      port: Number(process.env.CM_EXPORTER_DB_CONFIG_PORT) || 3306,
      user: process.env.CM_EXPORTER_DB_CONFIG_USER || 'root',
      password: process.env.CM_EXPORTER_DB_CONFIG_PASSWORD || '',
      dbName: process.env.CM_EXPORTER_DB_CONFIG_DB_NAME || 'cm_exporter',
      ncpDbName: process.env.CM_EXPORTER_DB_CONFIG_NCP_DB_NAME || 'cm_ncp_exporter',
      poolMin: Number(process.env.CM_EXPORTER_DB_CONFIG_POOL_MIN) || 1,
      poolMax: Number(process.env.CM_EXPORTER_DB_CONFIG_POOL_MAX) || 5,
    },
  },

  logger: {
    silenceResponse: process.env.CM_EXPORTER_LOG_SILENCE_RESPONSE ? process.env.CM_EXPORTER_LOG_SILENCE_RESPONSE === 'true' : false,
  },

  victoriaMetrics: {
    CM_EXPORTER_VM_ADDRESS: process.env.CM_EXPORTER_VM_ADDRESS,
    CO_VM_SINGLE_ADDRESS: process.env.CO_VM_SINGLE_ADDRESS,
    CM_EXPORTER_VM_API: process.env.CM_EXPORTER_VM_API,
    vmSingleUrl: process.env.CM_EXPORTER_VM_SINGLE_ADDRESS || 'http://localhost',
    vmMultiUrl: process.env.CM_EXPORTER_VM_MULTI_ADDRESS || 'http://localhost',
    vmImport: process.env.CM_EXPORTER_VM_IMPORT || '/api/v1/import?extra_label=clusterUuid=',
    vmMultiBaseUrlInsert:
      process.env.CO_VM_MULTI_BASE_URL_INSERT || 'http://localhost',
    vmMultiBaseUrlSelect:
      process.env.CO_VM_MULTI_BASE_URL_SELECT || 'http://localhost',
    vmMultiAuthUrl: process.env.CO_VM_MULTI_AUTH_URL || 'http://localhost',
    vmMultiNamespaces: process.env.CO_VM_MULTI_NAMESPACE || 'vm-multi-tenant',
    vmMultiSecret: process.env.CO_VM_MULTI_SECRET || 'vm-auth-victoria-metrics-auth',
    vmMultiClusterUuid: process.env.CO_VM_MULTI_CLUSTER_UUID,
    vmOption: process.env.CM_EXPORTER_VM_OPTION || 'SINGLE',
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
    userId: process.env.CM_EXPORTER_SYSTEM_PARTYUSER_USERID || 'CARROT',
  },

  alert: {
    alertExpiredDate: process.env.CO_ALERT_EXPIRED_DATE || 60 * 60 * 24 // 1d
  },

  metricMeta: {
    specifiedNodePort: '9100'
  }
};
