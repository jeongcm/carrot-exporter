import AlertReceivedModel from '@/modules/Alert/models/alertReceived.model';
import AlertRuleModel from '@/modules/Alert/models/alertRule.model';
import AlertTimelineModel from '@/modules/Alert/models/alertTimeline.model';
import CustomerAccountModel from '@/modules/CustomerAccount/models/customerAccount.model';
import config from '@config/index';
import Sequelize from 'sequelize';

import tbCustomerModel from '@modules/CustomerAccount/models/tbCustomer.model';
import tbCustomerAccountCloudPlatformModel from '@modules/CustomerAccount/models/tbCustomerAccountCloudPlatform.model';
import NcpResourceModel from '@modules/Resources/models/ncp/ncpResource.model';
import ncpResourceGroupModel from '@modules/Resources/models/ncp/ncpResourceGroup.model';
import ResourceModel from '@modules/Resources/models/resource.model';
import ResourceGroupModel from '@modules/Resources/models/resourceGroup.model';
import PartyModel from '@modules/Party/models/party.model';
import PartyUserModel from '@modules/Party/models/partyUser.model';
import ResourceEventModel from '@modules/Resources/models/resourceEvent.model';
import MetricMetaModel from "@modules/Metric/models/metricMeta.model";

const host = config.db.mariadb.host;
const port = config.db.mariadb.port || 3306;
const user = config.db.mariadb.user;
const password = config.db.mariadb.password;
const database = config.db.mariadb.dbName;
const pool = {
  min: config.db.mariadb.poolMin,
  max: config.db.mariadb.poolMax,
};
const sequelize = new Sequelize.Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mariadb',
  timezone: '+00:00',
  dialectOptions: {
    autoJsonMap: true,
    connectTimeout: 10000, // 10초
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    min: pool.min,
    max: pool.max,
    acquire: 30000, // 30초
  },
  logQueryParameters: config.nodeEnv === 'development',

  logging: (query, time) => {
    // TODO: find a better way to leave a log
    //logger.info(time + 'ms' + ' ' + query);
  },

  //logging: console.log,
  benchmark: true,
  retry: {
    match: [/Deadlock/i],
    max: 3, // Maximum rety 3 times
    //    backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
    //    backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    //    timeout: 50000,
  },
});

const opsCommSequelize = new Sequelize.Sequelize('ops_comm', user, password, {
  host,
  port,
  dialect: 'mariadb',
  timezone: '+00:00',
  dialectOptions: {
    autoJsonMap: true,
    connectTimeout: 10000, // 10초
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    min: pool.min,
    max: pool.max,
    acquire: 30000, // 30초
  },
  logQueryParameters: config.nodeEnv === 'development',

  logging: (query, time) => {
    // TODO: find a better way to leave a log
    //logger.info(time + 'ms' + ' ' + query);
  },

  //logging: console.log,
  benchmark: true,
  retry: {
    match: [/Deadlock/i],
    max: 3, // Maximum rety 3 times
    //    backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
    //    backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    //    timeout: 50000,
  },
});

const opsApiSequelize = new Sequelize.Sequelize('ops_api', user, password, {
  host,
  port,
  dialect: 'mariadb',
  timezone: '+00:00',
  dialectOptions: {
    autoJsonMap: true,
    connectTimeout: 10000, // 10초
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    min: pool.min,
    max: pool.max,
    acquire: 30000, // 30초
  },
  logQueryParameters: config.nodeEnv === 'development',

  logging: (query, time) => {
    // TODO: find a better way to leave a log
    //logger.info(time + 'ms' + ' ' + query);
  },

  //logging: console.log,
  benchmark: true,
  retry: {
    match: [/Deadlock/i],
    max: 3, // Maximum rety 3 times
    //    backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
    //    backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    //    timeout: 50000,
  },
});

sequelize.authenticate();
opsCommSequelize.authenticate();
opsApiSequelize.authenticate();

export const DB = {
  CustomerAccount: CustomerAccountModel(sequelize),
  Resource: ResourceModel(sequelize),
  ResourceGroup: ResourceGroupModel(sequelize),
  AlertReceived: AlertReceivedModel(sequelize),
  AlertRule: AlertRuleModel(sequelize),
  AlertTimeline: AlertTimelineModel(sequelize),
  ResourceEvent: ResourceEventModel(sequelize),
  Party: PartyModel(sequelize),
  PartyUser: PartyUserModel(sequelize),
  MetricMeta: MetricMetaModel(sequelize),
  // NcpResource: NcpResourceModel(sequelize),
  // NcpResourceGroup: ncpResourceGroupModel(sequelize),
  sequelize, // connection instance (RAW queries)
};

export const OpsCommDB = {
  TbCustomer: tbCustomerModel(opsCommSequelize),
  opsCommSequelize,
};

export const OpsApiDB = {
  TbCustomerAccountCloudPlatform: tbCustomerAccountCloudPlatformModel(opsApiSequelize),
  opsApiSequelize,
};

//-----------------------------BE-CAREFULL------------------------------------
// below script is used to create table again with new model structure and data
//[[force: true]]  is used when changes made in database.
//[[force: false]] there would be no database change even you modify the models.
//                 Need to have a separate operation to apply database model change.
//-----------------------------------------------------------------------------

module.exports = {
  DB: DB,
  OpsCommDB: OpsCommDB,
  OpsApiDB: OpsApiDB,
};
// export default DB;
