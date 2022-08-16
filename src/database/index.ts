import Sequelize from 'sequelize';
import { writeFileSync } from 'fs';
import sequelizeErd from 'sequelize-erd';
import { logger } from '@/common/utils/logger';
import AlertRuleModel from '@/modules/Alert/models/alertRule.model';
import AlertReceivedModel from '@/modules/Alert/models/alertReceived.model';
import LogModel from '@/modules/Log/models/log.model';
import ChannelModel from '@/modules/Messaging/models/channel.model';
import CatalogPlanModel from '@/modules/ProductCatalog/models/catalogPlan.model';
import CatalogPlanProductModel from '@/modules/ProductCatalog/models/catalogPlanProduct.model';
import CatalogPlanProductPriceModel from '@/modules/ProductCatalog/models/catalogPlanProductPrice.model';
import IncidentModel from '@/modules/Incident/models/incident.model';
import IncidentActionModel from '@/modules/Incident/models/incidentAction.model';
import IncidentActionAttachmentModel from '@/modules/Incident/models/incidentActionAttachment.model';
import IncidentAlertReceivedModel from '@/modules/Incident/models/incidentAlertReceived.model';
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
import AlertNotificationModel from '@/modules/Notification/models/alertNotification.model';
import PartyResourceModel from '@/modules/Party/models/partyResource.model';
import PartyUserLogsModel from '@/modules/Party/models/partyUserLogs.model';
import config from '@config/index';
import InitialRecordService from './initialRecord';

import SubscriptionModel from '@/modules/Subscriptions/models/subscriptions.model';
import SubscribedProductModel from '@/modules/Subscriptions/models/subscribedProduct.model';
import SubscriptionHistoryModel from '@/modules/Subscriptions/models/subscripionHistory.model';
import invitationModel from '@/modules/Party/models/invitation.model';
import MetricMetaModel from '@/modules/Metric/models/metricMeta.model';
import ChartModel from '@/modules/Metric/models/chart.model';

import metricReceivedModel from '@/modules/Metric/models/metricReceived.model';
import discountModel from '@/modules/Billing/models/discount.model';
import couponModel from '@/modules/Billing/models/coupon.model';
import billingAccountDiscountModel from '@/modules/Billing/models/billingAccountDiscount.model';
import billingAccountModel from '@/modules/Billing/models/billingAccount.model';
import paymentTenderModel from '@/modules/Billing/models/paymentTender.model';
import GrafanaSettingModel from '@/modules/Grafana/models/grafanaSetting.model';
import BayesianModelTable from '@/modules/MetricOps/models/bayesianModel.model';
import ResolutionActionModel from '@/modules/MetricOps/models/resolutionAction.model';
import SudoryTemplateModel from '@/modules/MetricOps/models/sudoryTemplate.model';
import RuleGroupModel from '@/modules/MetricOps/models/ruleGroup.model';
import ruleGroupAlertRuleModel from '@/modules/MetricOps/models/ruleGroupAlertRule.model';
import RuleGroupResolutionActionModel from '@/modules/MetricOps/models/RuleGroupResolutionAction.model';
import ModelRuleScoreModel from '@/modules/MetricOps/models/modelRuleScore.model';
import AnomalyMonitoringTargetModel from '@/modules/MetricOps/models/monitoringTarget.model';
import RoleModel from '@/modules/Role/models/role.model';
import RolePartyModel from '@/modules/Role/models/roleParty.model';
import ExecutorServiceModel from '@/modules/CommonService/models/exectuorService.model';
import SudoryWebhookModel from '@/modules/CommonService/models/sudoryWebhook.model';
import ExportersModel from '@/modules/Exporters/models/exporters.model';
import TokenModel from '@/modules/Token/token.model';
import EvaluationModel from '@/modules/MetricOps/models/evaluate.model';

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
    autoJsonMap: false,
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
    // logger.info(time + 'ms' + ' ' + query);
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
  TableId: TableIdModel(sequelize),
  Messages: MessageModel(sequelize),
  Log: LogModel(sequelize),
  Channel: ChannelModel(sequelize),
  Incident: IncidentModel(sequelize),
  IncidentAction: IncidentActionModel(sequelize),
  IncidentActionAttachment: IncidentActionAttachmentModel(sequelize),
  IncidentAlertReceived: IncidentAlertReceivedModel(sequelize),
  CatalogPlan: CatalogPlanModel(sequelize),
  CatalogPlanProduct: CatalogPlanProductModel(sequelize),
  CatalogPlanProductPrice: CatalogPlanProductPriceModel(sequelize),
  CommonCode: CommonCodeModel(sequelize),
  CustomerAccount: CustomerAccountModel(sequelize),
  Address: AddressModel(sequelize),
  CustomerAccountAddress: CustomerAccountAddressModel(sequelize),
  Api: ApiModel(sequelize),
  Party: PartyModel(sequelize),
  PartyChannel: PartyChannelModel(sequelize),
  Resource: ResourceModel(sequelize),
  ResourceGroup: ResourceGroupModel(sequelize),
  PartyRelation: PartyRelationModel(sequelize),
  PartyUser: PartyUserModel(sequelize),
  PartyUserLogs: PartyUserLogsModel(sequelize),
  Notification: NotificationModel(sequelize),
  AlertNotification: AlertNotificationModel(sequelize),
  Subscription: SubscriptionModel(sequelize),
  SubscribedProduct: SubscribedProductModel(sequelize),
  SubscriptionHistory: SubscriptionHistoryModel(sequelize),
  PartyResource: PartyResourceModel(sequelize),
  AlertReceived: AlertReceivedModel(sequelize),
  AlertRule: AlertRuleModel(sequelize),
  Invitation: invitationModel(sequelize),
  MetricMeta: MetricMetaModel(sequelize),
  Chart: ChartModel(sequelize),
  MetricReceived: metricReceivedModel(sequelize),
  Discount: discountModel(sequelize),
  Coupon: couponModel(sequelize),
  BillingAccountDiscount: billingAccountDiscountModel(sequelize),
  BillingAccount: billingAccountModel(sequelize),
  PaymentTender: paymentTenderModel(sequelize),
  GrafanaSetting: GrafanaSettingModel(sequelize),
  BayesianModel: BayesianModelTable(sequelize),
  ResolutionAction: ResolutionActionModel(sequelize),
  SudoryTemplate: SudoryTemplateModel(sequelize),
  RuleGroup: RuleGroupModel(sequelize),
  RuleGroupAlertRule: ruleGroupAlertRuleModel(sequelize),
  RuleGroupResolutionAction: RuleGroupResolutionActionModel(sequelize),
  ModelRuleScore: ModelRuleScoreModel(sequelize),
  AnomalyMonitoringTarget: AnomalyMonitoringTargetModel(sequelize),
  Role: RoleModel(sequelize),
  RoleParty: RolePartyModel(sequelize),
  SudoryWebhook: SudoryWebhookModel(sequelize),
  ExecutorService: ExecutorServiceModel(sequelize),
  Exporters: ExportersModel(sequelize),
  Tokens: TokenModel(sequelize),
  Evaluation: EvaluationModel(sequelize),
  sequelize, // connection instance (RAW queries)
};

//Different Relations among different tables
DB.CustomerAccount.hasMany(DB.Incident, { foreignKey: 'customerAccountKey' });
DB.Incident.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.CustomerAccount.hasMany(DB.Resource, { foreignKey: 'customerAccountKey' });
DB.Resource.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.CustomerAccount.hasMany(DB.ResourceGroup, { foreignKey: 'customerAccountKey' });
DB.ResourceGroup.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.ResourceGroup.hasMany(DB.Resource, { foreignKey: 'resource_group_key' });
DB.Resource.belongsTo(DB.ResourceGroup, { foreignKey: 'resource_group_key' });

DB.ResourceGroup.hasMany(DB.Chart, { foreignKey: 'resource_group_key' });
DB.Chart.belongsTo(DB.ResourceGroup, { foreignKey: 'resource_group_key' });

DB.Discount.hasMany(DB.Coupon, { foreignKey: 'discountKey' });
DB.Coupon.belongsTo(DB.Discount, { foreignKey: 'discountKey' });

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

DB.CustomerAccount.hasMany(DB.ExecutorService, { foreignKey: 'customer_account_key' });
DB.ExecutorService.belongsTo(DB.CustomerAccount, { foreignKey: 'customer_account_key' });

DB.Incident.belongsToMany(DB.AlertReceived, {
  through: DB.IncidentAlertReceived,
  foreignKey: 'incidentKey',
  otherKey: 'alertReceivedKey',
  as: 'alertReceived',
});
DB.AlertReceived.belongsToMany(DB.Incident, {
  through: DB.IncidentAlertReceived,
  foreignKey: 'alertReceivedKey',
  otherKey: 'incidentKey',
  as: 'incidents',
});

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
DB.AlertReceived.belongsTo(DB.AlertRule, { foreignKey: 'alertRuleKey', as: 'alertRule' });

//jerry, strange erorr, Sequelize genereates wrong fk. commented out as a workaround.  7/27/22
DB.ResourceGroup.hasMany(DB.AlertRule, { foreignKey: 'resourceGroupUuid' });
DB.AlertRule.belongsTo(DB.ResourceGroup, { foreignKey: 'resourceGroupUuid' });

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

DB.CustomerAccount.hasMany(DB.Invitation, { foreignKey: 'customerAccountKey' });
DB.Invitation.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.Messages.hasMany(DB.Invitation, { foreignKey: 'messageKey' });
DB.Invitation.belongsTo(DB.Messages, { foreignKey: 'messageKey' });

DB.Party.hasMany(DB.PartyChannel, { foreignKey: 'partyKey' });
DB.PartyChannel.belongsTo(DB.Party, { foreignKey: 'partyKey' });

DB.PartyChannel.hasMany(DB.Notification, { foreignKey: 'partyChannelKey' });
DB.Notification.belongsTo(DB.PartyChannel, { foreignKey: 'partyChannelKey' });

DB.Party.hasMany(DB.Notification, { foreignKey: 'partyKey' });
DB.Notification.belongsTo(DB.Party, { foreignKey: 'partyKey' });

DB.Messages.hasOne(DB.Notification, { foreignKey: 'messageKey' });
DB.Notification.belongsTo(DB.Messages, { foreignKey: 'messageKey' });

DB.CustomerAccount.hasMany(DB.Notification, { foreignKey: 'customerAccountKey' });
DB.Notification.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.RuleGroup.hasMany(DB.RuleGroupAlertRule, { foreignKey: 'ruleGroupKey' });
DB.RuleGroupAlertRule.belongsTo(DB.RuleGroup, { foreignKey: 'ruleGroupKey' });

DB.RuleGroup.hasMany(DB.RuleGroupResolutionAction, { foreignKey: 'rule_group_key' });
DB.RuleGroupResolutionAction.belongsTo(DB.RuleGroup, { foreignKey: 'rule_group_key' });

DB.AlertRule.hasMany(DB.RuleGroupAlertRule, { foreignKey: 'alertRuleKey' });
DB.RuleGroupAlertRule.belongsTo(DB.AlertRule, { foreignKey: 'alertRuleKey' });

DB.ResolutionAction.hasMany(DB.RuleGroupResolutionAction, { foreignKey: 'resolution_action_key' });
DB.RuleGroupResolutionAction.belongsTo(DB.ResolutionAction, { foreignKey: 'resolution_action_key' });

DB.Resource.hasMany(DB.AnomalyMonitoringTarget, { foreignKey: 'resource_key' });
DB.AnomalyMonitoringTarget.belongsTo(DB.Resource, { foreignKey: 'resource_key' });

DB.ResourceGroup.hasMany(DB.Resource, { foreignKey: 'resource_group_key' });
DB.Resource.belongsTo(DB.ResourceGroup, { foreignKey: 'resource_group_key' });

// DB.AnomalyMonitoringTarget.hasOne(DB.PartyUser, { foreignKey: 'created_by' });
// DB.PartyUser.belongsTo(DB.AnomalyMonitoringTarget, { foreignKey: 'party_user_id' });

DB.RuleGroup.hasMany(DB.ModelRuleScore, { foreignKey: 'rule_group_key' });
DB.ModelRuleScore.belongsTo(DB.RuleGroup, { foreignKey: 'rule_group_key' });

DB.BayesianModel.hasMany(DB.ModelRuleScore, { foreignKey: 'bayesian_model_key' });
DB.ModelRuleScore.belongsTo(DB.BayesianModel, { foreignKey: 'bayesian_model_key' });

DB.SudoryTemplate.hasMany(DB.ResolutionAction, { foreignKey: 'sudory_template_key' });
DB.ResolutionAction.belongsTo(DB.SudoryTemplate, { as: 'sudoryTemplate', foreignKey: 'sudory_template_key' });

DB.BayesianModel.hasMany(DB.ModelRuleScore, { foreignKey: 'bayesian_model_key' });
DB.ModelRuleScore.belongsTo(DB.BayesianModel, { foreignKey: 'bayesian_model_key' });

DB.BayesianModel.hasMany(DB.AnomalyMonitoringTarget, { foreignKey: 'bayesian_model_key' });
DB.AnomalyMonitoringTarget.belongsTo(DB.BayesianModel, { foreignKey: 'bayesian_model_key' });

DB.ResourceGroup.hasOne(DB.RuleGroup, { foreignKey: 'resource_group_key' });
DB.RuleGroup.belongsTo(DB.ResourceGroup, { foreignKey: 'resource_group_key' });

DB.ResourceGroup.hasOne(DB.BayesianModel, { foreignKey: 'resource_group_key' });
DB.BayesianModel.belongsTo(DB.ResourceGroup, { foreignKey: 'resource_group_key' });

DB.AnomalyMonitoringTarget.hasMany(DB.Evaluation, { foreignKey: 'anomalyMonitoringTargetKey' });
DB.Evaluation.belongsTo(DB.AnomalyMonitoringTarget, { foreignKey: 'anomalyMonitoringTargetKey' });

DB.Party.belongsToMany(DB.Resource, {
  through: {
    model: 'PartyResource',
    unique: false,
  },
  foreignKey: 'partyKey',
  // otherKey: 'resourceKey',
  as: 'resource',
});
DB.Resource.belongsToMany(DB.Party, {
  through: {
    model: 'PartyResource',
    unique: false,
  },
  foreignKey: 'resourceKey',
  // otherKey: 'partyKey',
  as: 'party',
});

DB.Party.hasMany(DB.PartyResource, { foreignKey: 'partyKey' });
DB.Resource.hasMany(DB.PartyResource, { foreignKey: 'resourceKey' });
DB.PartyResource.belongsTo(DB.Party, { foreignKey: 'partyKey' });
DB.PartyResource.belongsTo(DB.Resource, { foreignKey: 'resourceKey' });

DB.PartyUser.belongsToMany(DB.Api, {
  through: {
    model: 'PartyUserLogs',
    unique: false,
  },
  foreignKey: 'partyUserKey',
  as: 'api',
});
DB.Api.belongsToMany(DB.PartyUser, {
  through: {
    model: 'PartyUserLogs',
    unique: false,
  },
  foreignKey: 'apiKey',
  as: 'partyUser',
});

DB.Api.hasMany(DB.PartyUserLogs, { foreignKey: 'apiKey' });
DB.PartyUserLogs.belongsTo(DB.Api, { foreignKey: 'apiKey' });

DB.CustomerAccount.hasMany(DB.MetricReceived, { foreignKey: 'customerAccountKey' });
DB.MetricReceived.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.MetricMeta.hasMany(DB.MetricReceived, { foreignKey: 'metricMetaKey' });
DB.MetricReceived.belongsTo(DB.MetricMeta, { foreignKey: 'metricMetaKey' });

DB.CustomerAccount.hasMany(DB.MetricMeta, { foreignKey: 'customerAccountKey' });
DB.MetricMeta.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.Resource.hasMany(DB.MetricMeta, { foreignKey: 'resourceKey' });
DB.MetricMeta.belongsTo(DB.Resource, { foreignKey: 'resourceKey' });

DB.BillingAccount.hasMany(DB.PaymentTender, { foreignKey: 'billingAccountKey' });
DB.PaymentTender.belongsTo(DB.BillingAccount, { foreignKey: 'billingAccountKey' });

DB.CustomerAccount.hasMany(DB.BillingAccount, { foreignKey: 'customerAccountKey' });
DB.BillingAccount.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.Address.hasOne(DB.BillingAccount, { foreignKey: 'addressKey' });
DB.BillingAccount.belongsTo(DB.Address, { foreignKey: 'addressKey' });

DB.BillingAccount.hasOne(DB.BillingAccountDiscount, { foreignKey: 'billingAccountKey' });
DB.BillingAccountDiscount.belongsTo(DB.BillingAccount, { foreignKey: 'billingAccountKey' });

DB.Discount.hasOne(DB.BillingAccountDiscount, { foreignKey: 'discountKey' });
DB.BillingAccountDiscount.belongsTo(DB.Discount, { foreignKey: 'discountKey' });

DB.CustomerAccount.hasMany(DB.BayesianModel, { foreignKey: 'customerAccountKey' });
DB.BayesianModel.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.RuleGroup.hasMany(DB.RuleGroupResolutionAction, { foreignKey: 'ruleGroupKey' });
DB.RuleGroupResolutionAction.belongsTo(DB.RuleGroup, { foreignKey: 'ruleGroupKey' });

DB.CustomerAccount.hasMany(DB.Role, { foreignKey: 'customerAccountKey' });
DB.Role.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.Role.hasMany(DB.RoleParty, { foreignKey: 'roleKey' });
DB.Party.hasMany(DB.RoleParty, { foreignKey: 'partyKey' });
DB.RoleParty.belongsTo(DB.Role, { foreignKey: 'roleKey' });
DB.RoleParty.belongsTo(DB.Party, { foreignKey: 'partyKey' });

DB.CustomerAccount.hasMany(DB.Evaluation, { foreignKey: 'customerAccountKey' });
DB.Evaluation.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.BayesianModel.hasMany(DB.Evaluation, { foreignKey: 'bayesianModelKey' });
DB.Evaluation.belongsTo(DB.BayesianModel, { foreignKey: 'bayesianModelKey' });

DB.ResourceGroup.hasMany(DB.Evaluation, { foreignKey: 'bayesianModelKey' });
DB.Evaluation.belongsTo(DB.ResourceGroup, { foreignKey: 'bayesianModelKey' });

//-----------------------------BE-CAREFULL------------------------------------
// below script is used to create table again with new model structure and data
//[[force: true]]  is used when changes made in database.
//[[force: false]] there would be no database change even you modify the models.
//                 Need to have a separate operation to apply database model change.

DB.sequelize
  .sync({ force: false })
  .then(async () => {
    const initialRecordService = new InitialRecordService();

    initialRecordService.insertInitialRecords().then(() => {
      console.log('Yes resync done');
    });
  })
  .catch(console.log);

//-----------------------------------------------------------------------------

/**
 * Save live ERD in svg on development mode
 */
/*
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
*/

export default DB;
