/*
How to add config:
1. define a config here using the right nested object
2. add the environment variable in .env.sample file
3. define the type of the environment variable in validateEnv, IF the variable is required
*/

// RYAN: we still need to use config to control all the environment variables
// 1. For organization using nested objects
// 2. For value control (default, computed)
// 3. For security
import validateEnv from './validateEnv';
import tableIds from '../../init/tableId.seeding.json';
import api from '../../init/api.seeding.json';
import role from '../../init/role.seeding.json';

validateEnv();

export default {
  appPort: process.env.NC_LARI_PORT || 5000,
  nodeEnv: process.env.NC_LARI_ENV || 'development',
  maxApiBodySize: process.env.NC_MAX_API_BODY_SIZE || '50mb',
  logFormat: process.env.NC_LARI_LOG_FORMAT,
  cors: {
    allowAnyOrigin: process.env.NC_LARI_CORS_ORIGIN === 'true' ? Boolean(process.env.NC_LARI_CORS_ORIGIN) : process.env.NC_LARI_CORS_ORIGIN,
    credentials: process.env.NC_LARI_CORS_CREDENTIALS === 'true',
  },
  email: {
    defaultFrom: process.env.NC_LARI_EMAIL_DEFAULT_FROM || 'info@nexclipper.io',
    verification: {
      verityPageURL: process.env.NC_LARI_EMAIL_VERIFICATION_PAGE_URL,
    },
    invitation: {
      from: process.env.NC_LARI_EMAIL_DEFAULT_FROM || 'info@nexclipper.io',
    },
    passwordReset: {
      resetPageURL: process.env.NC_LARI_EMAIL_PASSWORD_RESET_PAGE_URL,
    },
    mailgun: {
      apiKey: process.env.NC_LARI_MAILGUN_API_KEY,
      domain: process.env.NC_LARI_MAILGUN_DOMAIN,
    },
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
  auth: {
    jwtSecretKey: process.env.NC_LARI_JWT_SECRET_KEY,
    systemVerifyKey: process.env.NC_LARI_SYSTEM_NAME,
    authTokenExpirySecond: Number(process.env.AUTH_TOKEN_EXPIRY_SECOND) || 60 * 60 * 3,
  },
  socialKey: {
    github: {
      clientID: process.env.NC_LARI_SOCIALKEY_GITHUB_CLIENT_ID,
      clientSecret: process.env.NC_LARI_SOCIALKEY_GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.NC_LARI_SOCIALKEY_GITHUB_CALLBACK_URL,
    },
    google: {
      clientID: process.env.NC_LARI_SOCIALKEY_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NC_LARI_SOCIALKEY_GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NC_LARI_SOCIALKEY_GOOGLE_CALLBACK_URL,
    },
  },
  initialRecord: {
    customerAccount: {
      customerAccountName: process.env.NC_LARI_SYSTEM_CUSTOMERACCOUNT_NAME.replace(/_/gi, ' '),
      customerAccountDescription: process.env.NC_LARI_SYSTEM_CUSTOMERACCOUNT_DESCRIPTION.replace(/_/gi, ' '),
    },
    party: {
      partyName: process.env.NC_LARI_SYSTEM_PARTY_NAME,
      partyDescription: process.env.NC_LARI_SYSTEM_PARTY_DESCRIPTION.replace(/_/gi, ' '),
    },
    partyUser: {
      firstName: process.env.NC_LARI_SYSTEM_PARTYUSER_FIRSTNAME,
      lastName: process.env.NC_LARI_SYSTEM_PARTYUSER_LASTNAME,
      userId: process.env.NC_LARI_SYSTEM_PARTYUSER_USERID,
      password: process.env.NC_LARI_SYSTEM_PARTYUSER_PASSWORD,
      email: process.env.NC_LARI_SYSTEM_PARTYUSER_EMAIL,
    },
    tableIds,
    api,
    role,
  },
  deadLock: {
    retries: Number(process.env.NC_LARI_DEADLOCK_RETRIES) || 5,
    maxMillis: Number(process.env.NC_LARI_DEADLOCK_MAXMILLIS) || 100,
    minMillis: Number(process.env.NC_LARI_DEADLOCK_MINMILLIS) || 1,
  },
  fuseBillApiDetail: {
    apiKey: process.env.FUSEBILL_API_KEY,
    baseURL: process.env.FUSEBILL_BASE_URL,
  },
  ncCronApiDetail: {
    baseURL: process.env.NC_CRON_URL || 'http://localhost:5010/scheduler',
    authToken: process.env.NC_CRON_X_AUTH_TOKEN || 'CRON',
  },
  sudoryApiDetail: {
    authToken: process.env.SUDORY_X_AUTH_TOKEN || 'SUDORY',
    baseURL: process.env.SUDORY_BASE_URL || 'http://localhost:8099',
    pathCreateCluster: process.env.SUDORY_PATH_CREATECLUSTER || '/server/cluster',
    pathCreateToken: process.env.SUDORY_PATH_CREATETOKEN || '/server/cluster_token',
    pathSession: process.env.SUDORY_PATH_SESSION || '/server/session',
    pathService: process.env.SUDORY_PATH_SERVICE || '/server/service',
    channel_resource: process.env.SUDORY_SUBSCRIBED_CHANNEL_RESOURCE || 'nc_resource',
    channel_alert: process.env.SUDORY_SUBSCRIBED_CHANNEL_ALERT || 'nc_alert',
    channel_metric: process.env.SUDORY_SUBSCRIBED_CHANNEL_METRIC || 'nc_metric',
    channel_metric_received: process.env.SUDORY_SUBSCRIBED_CHANNEL_METRIC_RECEIVED || 'nc_metric_received',
    service_result_delete: process.env.SUDORY_SERVICE_RESULT_DELETE || "1",
  },
  fileUpload: {
    DOBucket: process.env.NC_LARI_DO_BUCKET,
    DOAccessKeyId: process.env.NC_LARI_DO_ACCESS_KEY_ID,
    DOSecretAccessKey: process.env.NC_LARI_DO_SECRET_ACCESS_KEY,
    awsS3DefaultRegion: process.env.NC_LARI_DO_DEFAULT_REGION,
    DOEndPoint: process.env.NC_LARI_DO_ENDPOINT,
  },
  victoriaMetrics: {
    NC_LARI_VM_ADDRESS: process.env.NC_LARI_VM_ADDRESS,
    NC_LARI_VM_API: process.env.NC_LARI_VM_API, 
  },
};
