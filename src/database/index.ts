import Sequelize from 'sequelize';
import { writeFileSync } from 'fs';
import sequelizeErd from 'sequelize-erd';
import { logger } from '@/common/utils/logger';
import UserModel from '@/modules/UserTenancy/models/users.model';
import AccessGroupModel from '@/modules/UserTenancy/models/accessGroup.model';
import AlertModel from '@/modules/Alert/models/alert.model';
import LogModel from '@/modules/Log/models/log.model';
import TokenModel from '@/modules/UserTenancy/models/token.model';
import ClusterModel from '@/modules/K8sResource/models/cluster.model';
import AccessGroupChannelModel from '@/modules/UserTenancy/models/accessGroupChannel.model';
import AccessGroupClusterModel from '@/modules/UserTenancy/models/accessGroupCluster.model';
import AccessGroupMemberModel from '@/modules/UserTenancy/models/accessGroupMember.model';
import ChannelModel from '@/modules/Messaging/models/channel.model';
import TenancyModel from '@/modules/UserTenancy/models/tenancy.model';
import IncidentModel from '@/modules/Incident/models/incident.model';
import IncidentRelAlertModel from '@/modules/Incident/models/incidentRelAlert.model';
import InvitationModel from '@/modules/UserTenancy/models/invitation.model';
import IncidentActionModel from '@/modules/Incident/models/incidentAction.model';
import TenancyMemberModel from '@/modules/UserTenancy/models/tenancyMember.model';
import config from 'config';

const host = config.db.mariadb.host;
const user = config.db.mariadb.user;
const password = config.db.mariadb.password;
const database = config.db.mariadb.dbName;
const pool = {
  min: config.db.mariadb.poolMin,
  max: config.db.mariadb.poolMax,
};
const sequelize = new Sequelize.Sequelize(database, user, password, {
  host: host,
  dialect: 'mariadb',
  timezone: '+00:00',
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
    logger.info(time + 'ms' + ' ' + query);
  },
  benchmark: true,
});

sequelize.authenticate();

const DB = {
  Users: UserModel(sequelize),
  AccessGroup: AccessGroupModel(sequelize),
  AccessGroupChannel: AccessGroupChannelModel(sequelize),
  AccessGroupCluster: AccessGroupClusterModel(sequelize),
  AccessGroupMember: AccessGroupMemberModel(sequelize),
  Tenancies: TenancyModel(sequelize),
  TenancyMembers: TenancyMemberModel(sequelize),
  Alerts: AlertModel(sequelize),
  Log: LogModel(sequelize),
  Clusters: ClusterModel(sequelize),
  Channel: ChannelModel(sequelize),
  Incident: IncidentModel(sequelize),
  IncidentRelAlert: IncidentRelAlertModel(sequelize),
  IncidentAction: IncidentActionModel(sequelize),
  Invitations: InvitationModel(sequelize),
  Tokens: TokenModel(sequelize),
  sequelize, // connection instance (RAW queries)
};

//Different Relations among different tables

DB.Tenancies.hasOne(DB.Users, { as: 'users', foreignKey: 'currentTenancyId' });
DB.Users.belongsTo(DB.Tenancies, { as: 'currentTenancy', foreignKey: 'currentTenancyId' });

DB.Users.hasMany(DB.TenancyMembers, { foreignKey: 'userId' });
DB.TenancyMembers.belongsTo(DB.Users, { foreignKey: 'userId' });

DB.Users.hasMany(DB.Incident, { foreignKey: 'assigneeId', as: 'incidents' });
DB.Incident.belongsTo(DB.Users, { foreignKey: 'assigneeId', as: 'assignee' });

DB.AccessGroup.belongsToMany(DB.Channel, { through: 'AccessGroupChannel', sourceKey: 'id', targetKey: 'id', as: 'channels' });
DB.Channel.belongsToMany(DB.AccessGroup, { through: 'AccessGroupChannel', sourceKey: 'id', targetKey: 'id', as: 'accessGroup' });

DB.AccessGroupChannel.belongsTo(DB.Channel, { foreignKey: 'channelId' });
DB.AccessGroupChannel.belongsTo(DB.AccessGroup, { foreignKey: 'accessGroupId' });

DB.AccessGroup.belongsToMany(DB.Users, { through: 'AccessGroupMember', sourceKey: 'id', targetKey: 'id', as: 'members' });
DB.Users.belongsToMany(DB.AccessGroup, { through: 'AccessGroupMember', sourceKey: 'id', targetKey: 'id', as: 'accessGroup' });

DB.AccessGroupMember.belongsTo(DB.Users, { foreignKey: 'userId' });
DB.AccessGroupMember.belongsTo(DB.AccessGroup, { foreignKey: 'accessGroupId' });

DB.AccessGroup.belongsToMany(DB.Clusters, { through: 'AccessGroupCluster', sourceKey: 'id', targetKey: 'id', as: 'clusters' });
DB.Clusters.belongsToMany(DB.AccessGroup, { through: 'AccessGroupCluster', sourceKey: 'id', targetKey: 'id', as: 'accessGroupClusters' });

DB.AccessGroupCluster.belongsTo(DB.Clusters, { foreignKey: 'clusterId' });
DB.AccessGroupCluster.belongsTo(DB.AccessGroup, { foreignKey: 'accessGroupId' });

DB.Alerts.belongsToMany(DB.Incident, { through: 'IncidentRelAlert' });
DB.Incident.belongsToMany(DB.Alerts, { through: 'IncidentRelAlert' });

DB.IncidentRelAlert.belongsTo(DB.Alerts, { foreignKey: 'alertId' });
DB.IncidentRelAlert.belongsTo(DB.Incident, { foreignKey: 'incidentId' });

//-----------------------------BE-CAREFULL------------------------------------
// below script is used to create table again with new model structure and data
//[[force: true]] is used when changes made in database.

DB.sequelize.sync({ force: false }).then(() => {
  console.log('Yes resync done');
});

//-----------------------------------------------------------------------------

/**
 * Save live ERD in svg on development mode
 */
if (config.nodeEnv === 'development') {
  const saveErdToSvg = async () => {
    const svg = await sequelizeErd({
      source: sequelize,
      engine: 'twopi', // "circo", "dot", "fdp", "neato", "osage", "twopi".
      arrowShapes: {
        // Any of the below 4 options formatted ['startShape', 'endShape']. If excluded, the default is used.
        BelongsToMany: ['crow', 'crow'], // Default: ['none', 'crow']
        BelongsTo: ['inv', 'crow'], // Default: ['crow', 'none']
        HasMany: ['crow', 'inv'], // Default: ['none', 'crow']
        HasOne: ['dot', 'dot'], // Default: ['none', 'none']
      },
      arrowSize: 1.2, // Default: 0.6
      lineWidth: 1, // Default: 0.75
      color: 'green3', // Default: 'black'
    });
    writeFileSync('./readmes/img/erd.svg', svg);
  };
  saveErdToSvg();
}

export default DB;
