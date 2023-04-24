import Sequelize from 'sequelize';
import config from '@config/index';
import AlertRuleModel from '@/modules/Alert/models/alertRule.model';
import AlertReceivedModel from '@/modules/Alert/models/alertReceived.model';
import CustomerAccountModel from '@/modules/CustomerAccount/models/customerAccount.model';

import ResourceModel from '@/modules/Resources/models/resource.model';
import ResourceGroupModel from '@/modules/Resources/models/resourceGroup.model';
import ResourceEventModel from '@/modules/ResourceEvent/models/resourceEvent.model';

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

const DB = {
  CustomerAccount: CustomerAccountModel(sequelize),
  Resource: ResourceModel(sequelize),
  ResourceGroup: ResourceGroupModel(sequelize),
  AlertReceived: AlertReceivedModel(sequelize),
  AlertRule: AlertRuleModel(sequelize),
  ResourceEvent: ResourceEventModel(sequelize),
  sequelize, // connection instance (RAW queries)
};

//-----------------------------BE-CAREFULL------------------------------------
// below script is used to create table again with new model structure and data
//[[force: true]]  is used when changes made in database.
//[[force: false]] there would be no database change even you modify the models.
//                 Need to have a separate operation to apply database model change.
//-----------------------------------------------------------------------------

export default DB;
