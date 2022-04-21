import Sequelize from 'sequelize';
import { writeFileSync } from 'fs';
import sequelizeErd from 'sequelize-erd';
import { logger } from '@/common/utils/logger';
import UserModel from '@/modules/UserTenancy/models/users.model';
import AccessGroupModel from '@/modules/UserTenancy/models/accessGroup.model';
import AlertModel from '@/modules/Alert/models/alert.model';
import AlertRuleModel from '@/modules/Alert/models/alertRule.model';
import AlertReceivedModel from '@/modules/Alert/models/alertReceived.model';
import LogModel from '@/modules/Log/models/log.model';
import TokenModel from '@/modules/UserTenancy/models/token.model';
import ClusterModel from '@/modules/K8s/models/cluster.model';
import AccessGroupChannelModel from '@/modules/UserTenancy/models/accessGroupChannel.model';
import AccessGroupClusterModel from '@/modules/UserTenancy/models/accessGroupCluster.model';
import AccessGroupMemberModel from '@/modules/UserTenancy/models/accessGroupMember.model';
import ChannelModel from '@/modules/Messaging/models/channel.model';
import TenancyModel from '@/modules/UserTenancy/models/tenancy.model';
import CatalogPlanModel from '@/modules/ProductCatalog/models/catalogPlan.model';
import CatalogPlanProductModel from '@/modules/ProductCatalog/models/catalogPlanProduct.model';
import CatalogPlanProductPriceModel from '@/modules/ProductCatalog/models/catalogPlanProductPrice.model';
import IncidentModel from '@/modules/Incident/models/incident.model';
import IncidentActionModel from '@/modules/Incident/models/incidentAction.model';
import IncidentActionAttachmentModel from '@/modules/Incident/models/incidentActionAttachment.model';
import IncidentAlertReceivedModel from '@/modules/Incident/models/incidentAlertReceived.model';
import TenancyMemberModel from '@/modules/UserTenancy/models/tenancyMember.model';
import CommonCodeModel from '@/modules/CommonCode/models/commonCode.model';
import CustomerAccountModel from '@/modules/CustomerAccount/models/customerAccount.model';
import CustomerAccountAddressModel from '@/modules/CustomerAccount/models/customerAccountAddress.model';
import AddressModel from '@/modules/Address/models/address.model';
import ApiModel from '@/modules/Api/models/api.models';
import MessageModel from '@/modules/Messaging/models/message.model';
import PartyModel from '@/modules/Party/models/party.model';
import ResourceModel from '@/modules/Resources/models/resource.model';
import ResourceGroupModel from '@/modules/Resources/models/resourceGroup.model';
import PartyRelationModel from '@/modules/Party/models/partyRelation.model';
import PartyUserModel from '@/modules/Party/models/partyUser.model';
import TableIdModel from '@/modules/CommonService/models/tableIdmodel';
import PartyChannelModel from '@/modules/Party/models/partychannel.model';
import NotificationModel from '@/modules/Notification/models/notification.model';
import PartyResourceModel from '@/modules/Party/models/partyResource.model';
import config from 'config';
import InitialRecordService from './initialRecord';

import SubscriptionModel from '@/modules/Subscriptions/models/subscriptions.model';
import SubscribedProductModel from '@/modules/Subscriptions/models/subscribedProduct.model';
import SubscriptionHistoryModel from '@/modules/Subscriptions/models/subscritpionHistory.model';
import invitationModel from '@/modules/Party/models/invitation.model';


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
  IncidentAction: IncidentActionModel(sequelize),
  IncidentActionAttachment: IncidentActionAttachmentModel(sequelize),
  IncidentAlertReceived: IncidentAlertReceivedModel(sequelize),
  Tokens: TokenModel(sequelize),
  CatalogPlan: CatalogPlanModel(sequelize),
  CatalogPlanProduct: CatalogPlanProductModel(sequelize),
  CatalogPlanProductPrice: CatalogPlanProductPriceModel(sequelize),
  CommonCode: CommonCodeModel(sequelize),
  CustomerAccount: CustomerAccountModel(sequelize),
  Address: AddressModel(sequelize),
  CustomerAccountAddress: CustomerAccountAddressModel(sequelize),
  Api: ApiModel(sequelize),
  PartyChannel: PartyChannelModel(sequelize),
  TableId: TableIdModel(sequelize),
  Messages: MessageModel(sequelize),
  Party: PartyModel(sequelize),
  Resource: ResourceModel(sequelize),
  ResourceGroup: ResourceGroupModel(sequelize),
  PartyRelation: PartyRelationModel(sequelize),
  PartyUser: PartyUserModel(sequelize),
  Notification:NotificationModel(sequelize),
  Subscription: SubscriptionModel(sequelize),
  SubscribedProduct: SubscribedProductModel(sequelize),
  SubscriptionHistory: SubscriptionHistoryModel(sequelize),
  PartyResource: PartyResourceModel(sequelize),
  AlertReceived: AlertReceivedModel(sequelize),
  AlertRule: AlertRuleModel(sequelize),
  Invitation: invitationModel(sequelize),
  sequelize, // connection instance (RAW queries)
};

//Different Relations among different tables

DB.Tenancies.hasOne(DB.Users, { as: 'users', foreignKey: 'currentTenancyPk' });
DB.Users.belongsTo(DB.Tenancies, { as: 'currentTenancy', foreignKey: 'currentTenancyPk' });

DB.Users.hasMany(DB.TenancyMembers, { foreignKey: 'userPk' });
DB.TenancyMembers.belongsTo(DB.Users, { foreignKey: 'userPk' });

DB.Tenancies.hasMany(DB.TenancyMembers, { foreignKey: 'tenancyPk' });
DB.TenancyMembers.belongsTo(DB.Tenancies, { foreignKey: 'tenancyPk' });

DB.CustomerAccount.hasMany(DB.Incident, { foreignKey: 'customerAccountKey' });
DB.Incident.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.CustomerAccount.hasMany(DB.Resource, { foreignKey: 'customerAccountKey' });
DB.Resource.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.CustomerAccount.hasMany(DB.ResourceGroup, { foreignKey: 'customerAccountKey' });
DB.ResourceGroup.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.ResourceGroup.hasMany(DB.Resource, { foreignKey: 'resourceGroupKey' });
DB.Resource.belongsTo(DB.ResourceGroup, { foreignKey: 'resourceGroupKey' });

DB.Party.hasMany(DB.Incident, { foreignKey: 'assigneeKey', as: 'incidents' });
DB.Incident.belongsTo(DB.Party, { foreignKey: 'assigneeKey', as: 'assignee' });

DB.Incident.hasMany(DB.IncidentAction, { foreignKey: 'incidentKey' });
DB.IncidentAction.belongsTo(DB.Incident, { foreignKey: 'incidentKey' });

DB.IncidentAction.hasMany(DB.IncidentActionAttachment, { foreignKey: 'incidentActionKey' });
DB.IncidentActionAttachment.belongsTo(DB.IncidentAction, { foreignKey: 'incidentActionKey' });

DB.Channel.hasMany(DB.PartyChannel, { foreignKey: 'channelKey' });
DB.Party.hasMany(DB.PartyChannel, { foreignKey: 'partyKey' });
DB.PartyChannel.belongsTo(DB.Channel, { foreignKey: 'channelKey' });
DB.PartyChannel.belongsTo(DB.Party, { foreignKey: 'partyKey' });

//DB.AccessGroupChannel.belongsTo(DB.Channel, { foreignKey: 'channelPk' });
//DB.AccessGroupChannel.belongsTo(DB.AccessGroup, { foreignKey: 'accessGroupPk' });

DB.AccessGroup.belongsToMany(DB.Users, { through: 'AccessGroupMember', sourceKey: 'pk', targetKey: 'pk', as: 'members' });
DB.Users.belongsToMany(DB.AccessGroup, { through: 'AccessGroupMember', sourceKey: 'pk', targetKey: 'pk', as: 'accessGroup' });

DB.AccessGroupMember.belongsTo(DB.Users, { foreignKey: 'userPk' });
DB.AccessGroupMember.belongsTo(DB.AccessGroup, { foreignKey: 'accessGroupPk' });

DB.AccessGroup.belongsToMany(DB.Clusters, { through: 'AccessGroupCluster', sourceKey: 'pk', targetKey: 'pk', as: 'clusters' });
DB.Clusters.belongsToMany(DB.AccessGroup, { through: 'AccessGroupCluster', sourceKey: 'pk', targetKey: 'pk', as: 'accessGroupClusters' });

DB.AccessGroupCluster.belongsTo(DB.Clusters, { foreignKey: 'clusterPk' });
DB.AccessGroupCluster.belongsTo(DB.AccessGroup, { foreignKey: 'accessGroupPk' });

// DB.Alerts.belongsToMany(DB.Incident, { through: 'IncidentRelAlert' });
// DB.Incident.belongsToMany(DB.Alerts, { through: 'IncidentRelAlert' });

// DB.IncidentRelAlert.belongsTo(DB.Alerts, { foreignKey: 'alertPk' });
// DB.IncidentRelAlert.belongsTo(DB.Incident, { foreignKey: 'incidentPk' });

DB.CustomerAccount.belongsToMany(DB.Address, {
  through: 'CustomerAccountAddress',
  foreignKey: 'customerAccountKey',
  otherKey: 'addressKey',
  as: 'address',
});
DB.Address.belongsToMany(DB.CustomerAccount, {
  through: 'CustomerAccountAddress',
  foreignKey: 'addressKey',
  otherKey: 'customerAccountKey',
});

DB.CustomerAccount.hasMany(DB.AlertRule, { foreignKey: 'customerAccountKey' });
DB.AlertRule.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.AlertRule.hasMany(DB.AlertReceived, { foreignKey: 'alertRuleKey' });
DB.AlertReceived.belongsTo(DB.AlertRule, { foreignKey: 'alertRuleKey' });

DB.CustomerAccount.hasMany(DB.AlertReceived, { foreignKey: 'customerAccountKey' });
DB.AlertReceived.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.CatalogPlan.hasMany(DB.CatalogPlanProduct, { foreignKey: 'catalog_plan_key' });
DB.CatalogPlanProduct.belongsTo(DB.CatalogPlan, { foreignKey: 'catalog_plan_key' });

DB.CatalogPlanProduct.hasMany(DB.CatalogPlanProductPrice, { foreignKey: 'catalog_plan_product_key' });
DB.CatalogPlanProductPrice.belongsTo(DB.CatalogPlanProduct, { foreignKey: 'catalog_plan_product_key' });

DB.CatalogPlan.hasOne(DB.Subscription, { foreignKey: 'catalog_plan_key' });
DB.Subscription.belongsTo(DB.CatalogPlan, { foreignKey: 'catalog_plan_key' });

DB.Subscription.hasMany(DB.SubscriptionHistory, { foreignKey: 'subscription_key' });
DB.SubscriptionHistory.belongsTo(DB.Subscription, { foreignKey: 'subscription_key' });

DB.Subscription.hasMany(DB.SubscribedProduct, { foreignKey: 'subscription_key' });
DB.SubscribedProduct.belongsTo(DB.Subscription, { foreignKey: 'subscription_key' });

DB.CustomerAccount.hasMany(DB.Party, { foreignKey: 'customerAccountKey' });
DB.Party.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.Party.hasOne(DB.PartyUser, { foreignKey: 'partyKey', sourceKey: 'partyKey' });
DB.PartyUser.belongsTo(DB.Party, { foreignKey: 'partyKey', targetKey: 'partyKey' });

DB.Party.hasMany(DB.PartyRelation, { as: 'partyParent', foreignKey: 'partyParentKey', sourceKey: 'partyKey' });
DB.Party.hasMany(DB.PartyRelation, { as: 'partyChild', foreignKey: 'partyChildKey', sourceKey: 'partyKey' });
DB.PartyRelation.belongsTo(DB.Party, { as: 'partyParent', foreignKey: 'partyParentKey', targetKey: 'partyKey' });
DB.PartyRelation.belongsTo(DB.Party, { as: 'partyChild', foreignKey: 'partyChildKey', targetKey: 'partyKey' });


DB.CustomerAccount.hasOne(DB.Invitation,{foreignKey:'customerAccountKey'});
DB.Invitation.belongsTo(DB.CustomerAccount,{foreignKey:'customerAccountKey'});

DB.Messages.hasOne(DB.Invitation,{foreignKey:'messageKey'});
DB.Invitation.belongsTo(DB.Messages,{foreignKey:'messageKey'});


DB.Party.hasMany(DB.PartyChannel,{foreignKey: 'partyKey'})
DB.PartyChannel.belongsTo(DB.Party,{foreignKey: 'partyKey'})

DB.PartyChannel.hasMany(DB.Notification, {foreignKey: 'partyChannelKey'})
DB.Notification.belongsTo(DB.PartyChannel,{foreignKey: 'partyChannelKey'})


DB.Party.hasMany(DB.Notification,{foreignKey: 'partyKey'})
DB.Notification.belongsTo(DB.Party,{foreignKey: 'partyKey'})

DB.Messages.hasOne(DB.Notification,{foreignKey: 'messageKey'})
DB.Notification.belongsTo(DB.Messages,{foreignKey: 'messageKey'})

DB.CustomerAccount.hasMany(DB.Notification,{foreignKey: 'customerAccountKey'})
DB.Notification.belongsTo(DB.CustomerAccount,{foreignKey: 'customerAccountKey'})


DB.Party.belongsToMany(DB.Resource, {
  through: 'PartyResource',
  foreignKey: 'partyKey',
  otherKey: 'resourceKey',
  as: 'resource',
});
DB.Resource.belongsToMany(DB.Party, {
  through: 'PartyResource',
  foreignKey: 'resourceKey',
  otherKey: 'partyKey',
  as: 'party',
});

DB.Party.hasMany(DB.PartyResource, { foreignKey: 'partyKey' });
DB.Resource.hasMany(DB.PartyResource, { foreignKey: 'resourceKey' });
DB.PartyResource.belongsTo(DB.Party, { foreignKey: 'partyKey' });
DB.PartyResource.belongsTo(DB.Resource, { foreignKey: 'resourceKey' });



//-----------------------------BE-CAREFULL------------------------------------
// below script is used to create table again with new model structure and data
//[[force: true]] is used when changes made in database.

DB.sequelize
  .sync({ force: false })
  .then(async () => {
    const initialRecordService = new InitialRecordService();

    await initialRecordService.insertInitialRecords().then(() => {
      console.log('Yes resync done');
    });
  })
  .catch(console.log);

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
