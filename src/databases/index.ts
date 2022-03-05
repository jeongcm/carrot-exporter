import Sequelize from 'sequelize';
import { logger } from '@utils/logger';
import UserModel from '@models/users.model';
import AccessGroupModel from '@models/accessGroup.model';
import AlertModel from '@/models/alert.model';
import LogModel from '@/models/log.model';
import TokenModel from '@/models/token.model';
import ClusterModel from '@models/cluster.model';
import AccessGroupChannelModel from '@models/accessGroupChannel.model';
import AccessGroupClusterModel from '@models/accessGroupCluster.model';
import AccessGroupMemberModel from '@models/accessGroupMember.model';
import ChannelModel from '@models/channel.model';
import TenancyModel from '@/models/tenancy.model';
import IncidentModel from '@/models/incident.model';
import IncidentRelAlertModel from '@/models/incidentRelAlert.model';
import InvitationModel from '@/models/invitation.model';
import IncidentActionModel from '@/models/incidentAction.model';
import TenancyMemberModel from '@/models/tenancyMember.model';
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
  timezone: '+09:00',
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

export default DB;
