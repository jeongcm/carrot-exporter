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
  appPort: process.env.CO_AGGREGATOR_PORT || 7001,
  appUrl: process.env.CO_AGGREGATOR_URL || 'http://localhost',
  nodeEnv: process.env.CO_AGGREGATOR_ENV || 'development',
  maxApiBodySize: process.env.CO_MAX_API_BODY_SIZE || '50mb',
  logFormat: process.env.CO_AGGREGATOR_LOG_FORMAT,
  cors: {
    allowAnyOrigin: process.env.CO_AGGREGATOR_CORS_ORIGIN === 'true' ? Boolean(process.env.CO_AGGREGATOR_CORS_ORIGIN) : process.env.CO_AGGREGATOR_CORS_ORIGIN,
    credentials: process.env.CO_AGGREGATOR_CORS_CREDENTIALS === 'true',
  },
  db: {
    mariadb: {
      host: process.env.CO_AGGREGATOR_DB_CONFIG_HOST,
      port: Number(process.env.CO_AGGREGATOR_DB_CONFIG_PORT),
      user: process.env.CO_AGGREGATOR_DB_CONFIG_USER,
      password: process.env.CO_AGGREGATOR_DB_CONFIG_PASSWORD,
      dbName: process.env.CO_AGGREGATOR_DB_CONFIG_DB_NAME,
      poolMin: Number(process.env.CO_AGGREGATOR_DB_CONFIG_POOL_MIN),
      poolMax: Number(process.env.CO_AGGREGATOR_DB_CONFIG_POOL_MAX),
    },
  },

  logger: {
    silenceResponse: process.env.CO_AGGREGATOR_LOG_SILENCE_RESPONSE ? process.env.CO_AGGREGATOR_LOG_SILENCE_RESPONSE === 'true' : false,
  },

  victoriaMetrics: {
    CO_AGGREGATOR_VM_ADDRESS: process.env.CO_AGGREGATOR_VM_ADDRESS,
    CO_VM_SINGLE_ADDRESS: process.env.CO_VM_SINGLE_ADDRESS,
    CO_AGGREGATOR_VM_API: process.env.CO_AGGREGATOR_VM_API,
    vmMultiBaseUrlInsert:
      process.env.CO_VM_MULTI_BASE_URL_INSERT || 'http://vm-cluster-victoria-metrics-cluster-vminsert.vm-multi-tenant.svc.cluster.local:8480/insert',
    vmMultiBaseUrlSelect:
      process.env.CO_VM_MULTI_BASE_URL_SELECT || 'http://vm-cluster-victoria-metrics-cluster-vmselect.vm-multi-tenant.svc.cluster.local:8481/select',
    vmMultiAuthUrl: process.env.CO_VM_MULTI_AUTH_URL || 'http://vm-auth-victoria-metrics-auth..vm-multi-tenant.svc.cluster.local:8427',
    vmMultiNamespaces: process.env.CO_VM_MULTI_NAMESPACE || 'vm-multi-tenant',
    vmMultiSecret: process.env.CO_VM_MULTI_SECRET || 'vm-auth-victoria-metrics-auth',
    vmMultiClusterUuid: process.env.CO_VM_MULTI_CLUSTER_UUID,
    vmOption: process.env.CO_VM_OPTION || 'MULTI',
    vmOpenstackSwitch: process.env.CO_VM_OPENSTACK_SWITCH || 'off',
  },

  obsUrl: {
    kpsNamespace: process.env.CO_KPS_NAMESPACE || 'monitor',
    prometheusUrlHead: process.env.CO_PROMETHEUS_URL_HEAD || 'http://kps-kube-prometheus-stack-prometheus.',
    prometheusUrlTail: process.env.CO_PROMETHEUS_URL_TAIL || '.svc.cluster.local:9090',
  },
  oT: {
    oTTraceLogTurnOff: process.env.CO_TURN_OFF_TELEMETRY,
  },

  partyUser: {
    userId: process.env.CO_AGGREGATOR_SYSTEM_PARTYUSER_USERID
  }
};
