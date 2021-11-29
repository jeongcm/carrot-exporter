import config from 'config';
import Sequelize from 'sequelize';
import { logger } from '@utils/logger';
import { dbConfig } from '@interfaces/db.interface';
import UserModel from '@models/users.model';
import AccessGroupModel from '@models/accessGroup.model';
import AlertModel from '@/models/alert.model';
import ClusterModel from '@models/cluster.model';
import ChannelModel from '@models/channel.model';
import { logger } from '@utils/logger';
import TenancyModel from '@/models/tenancy.model';
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
  Tenancies: TenancyModel(sequelize),
  TenancyMembers: TenancyMemberModel(sequelize),
  Alerts: AlertModel(sequelize),
  Clusters: ClusterModel(sequelize),
  Channel: ChannelModel(sequelize),
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};

export default DB;
