import config from 'config';
import Sequelize from 'sequelize';
import { logger } from '@utils/logger';
import { dbConfig } from '@interfaces/db.interface';
import UserModel from '@models/users.model';
import AccessGroupModel from '@models/accessGroup.model';
import AlertModel from '@/models/alert.model';
import LogModel from '@/models/log.model';
import ClusterModel from '@models/cluster.model';
import AccessGroupChannelModel from '@models/accessGroupChannel.model';
import AccessGroupClusterModel from '@models/accessGroupCluster.model';
import AccessGroupMemberModel from '@models/accessGroupMember.model';
import ChannelModel from '@models/channel.model';
import TenancyModel from '@/models/tenancy.model';
import IncidentModel from '@/models/incident.model';
import IncidentRelAlertModel from '@/models/incidentRelAlert.model';
import IncidentActionModel from '@/models/incidentAction.model';
import TenancyMemberModel from '@/models/tenancyMember.model';

const { host, user, password, database, pool }: dbConfig = config.get('dbConfig');
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
  logQueryParameters: process.env.NODE_ENV === 'development',
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
  sequelize, // connection instance (RAW queries)
};

//Different Relations among different tables

DB.Tenancies.hasOne(DB.Users, { as: 'users', foreignKey: 'currentTenancyId' });
DB.Users.belongsTo(DB.Tenancies, { as: 'currentTenancy', foreignKey: 'currentTenancyId' });

DB.Users.hasMany(DB.TenancyMembers, {  foreignKey: 'userId' });
DB.TenancyMembers.belongsTo(DB.Users, {foreignKey: 'userId' });

DB.Users.hasMany(DB.Incident, { foreignKey: 'assigneeId', as: 'incidents' });
DB.Incident.belongsTo(DB.Users, { foreignKey: 'assigneeId', as: 'assignee' });

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
