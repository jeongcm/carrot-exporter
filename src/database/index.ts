import Sequelize from 'sequelize';
//import { writeFileSync } from 'fs';
//import sequelizeErd from 'sequelize-erd';
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
import SubscriptionHistoryModel from '@/modules/Subscriptions/models/subscriptionHistory.model';
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
import AnomalyMonitoringTargetResourceModel from '@/modules/MetricOps/models/monitoringTargetResource.model';
import RoleModel from '@/modules/Role/models/role.model';
import RolePartyModel from '@/modules/Role/models/roleParty.model';
import ExecutorServiceModel from '@/modules/CommonService/models/executorService.model';
import SudoryWebhookModel from '@/modules/CommonService/models/sudoryWebhook.model';
import ExportersModel from '@/modules/Exporters/models/exporters.model';
import TokenModel from '@/modules/Token/token.model';
import EvaluationModel from '@/modules/MetricOps/models/evaluate.model';
import ResourceEventModel from '@/modules/ResourceEvent/models/resourceEvent.model';
import AlertTargetGroupModel from '@/modules/Alert/models/alertTargetGroup.model';
import AlertTargetSubGroupModel from '@/modules/Alert/models/alertTargetSubGroup.model';
import AlertEasyRuleModel from '@/modules/Alert/models/alertEasyRule.model';
import PartyUserPasswordModel from '@/modules/Party/models/partyUserPassword.model';

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
  AnomalyMonitoringTargetResource: AnomalyMonitoringTargetResourceModel(sequelize),
  Role: RoleModel(sequelize),
  RoleParty: RolePartyModel(sequelize),
  SudoryWebhook: SudoryWebhookModel(sequelize),
  ExecutorService: ExecutorServiceModel(sequelize),
  Exporters: ExportersModel(sequelize),
  Tokens: TokenModel(sequelize),
  Evaluation: EvaluationModel(sequelize),
  ResourceEvent: ResourceEventModel(sequelize),
  AlertTargetGroup: AlertTargetGroupModel(sequelize),
  AlertTargetSubGroup: AlertTargetSubGroupModel(sequelize),
  AlertEasyRule: AlertEasyRuleModel(sequelize),
  PartyUserPassword: PartyUserPasswordModel(sequelize),
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

DB.ResourceGroup.hasMany(DB.AlertRule, { foreignKey: 'resource_group_uuid' });
DB.AlertRule.belongsTo(DB.ResourceGroup, { foreignKey: 'resource_group_uuid' });

DB.CustomerAccount.hasMany(DB.AlertReceived, { foreignKey: 'customerAccountKey' });
DB.AlertReceived.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.CatalogPlan.hasMany(DB.CatalogPlanProduct, { foreignKey: 'catalog_plan_key' });
DB.CatalogPlanProduct.belongsTo(DB.CatalogPlan, { foreignKey: 'catalog_plan_key' });

DB.CatalogPlanProduct.hasMany(DB.CatalogPlanProductPrice, { foreignKey: 'catalog_plan_product_key' });
DB.CatalogPlanProductPrice.belongsTo(DB.CatalogPlanProduct, { foreignKey: 'catalog_plan_product_key' });

DB.CatalogPlanProduct.hasMany(DB.SubscribedProduct, { foreignKey: 'catalog_plan_product_key' });
DB.SubscribedProduct.belongsTo(DB.CatalogPlanProduct, { foreignKey: 'catalog_plan_product_key' });

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

DB.Party.hasMany(DB.Notification, { foreignKey: 'partyKey' });
DB.Notification.belongsTo(DB.Party, { foreignKey: 'partyKey' });

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

DB.Resource.hasMany(DB.SubscribedProduct, { foreignKey: 'resource_key' });
DB.SubscribedProduct.belongsTo(DB.Resource, { foreignKey: 'resource_key' });

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

DB.ResourceGroup.hasOne(DB.RuleGroup, { foreignKey: 'resource_group_key' });
DB.RuleGroup.belongsTo(DB.ResourceGroup, { foreignKey: 'resource_group_key' });

DB.ResourceGroup.hasOne(DB.BayesianModel, { foreignKey: 'resource_group_key' });
DB.BayesianModel.belongsTo(DB.ResourceGroup, { foreignKey: 'resource_group_key' });

DB.BayesianModel.hasMany(DB.AnomalyMonitoringTarget, { foreignKey: 'bayesian_model_key' });
DB.AnomalyMonitoringTarget.belongsTo(DB.BayesianModel, { foreignKey: 'bayesian_model_key' });

DB.AnomalyMonitoringTarget.hasMany(DB.AnomalyMonitoringTargetResource, { foreignKey: 'anomalyMonitoringTargetKey' });
DB.AnomalyMonitoringTargetResource.belongsTo(DB.AnomalyMonitoringTarget, { foreignKey: 'anomalyMonitoringTargetKey' });

DB.AnomalyMonitoringTarget.hasMany(DB.Evaluation, { foreignKey: 'anomalyMonitoringTargetKey' });
DB.Evaluation.belongsTo(DB.AnomalyMonitoringTarget, { foreignKey: 'anomalyMonitoringTargetKey' });

DB.Evaluation.hasOne(DB.Incident, { foreignKey: 'evaluationKey' });
DB.Incident.belongsTo(DB.Evaluation, { foreignKey: 'evaluationKey' });

DB.SubscribedProduct.hasOne(DB.AnomalyMonitoringTarget, { foreignKey: 'subscribedProductKey' });
DB.AnomalyMonitoringTarget.belongsTo(DB.SubscribedProduct, { foreignKey: 'subscribedProductKey' });

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

DB.ResourceGroup.hasMany(DB.Evaluation, { foreignKey: 'resourceGroupKey' });
DB.Evaluation.belongsTo(DB.ResourceGroup, { foreignKey: 'resourceGroupKey' });

DB.CustomerAccount.hasMany(DB.ResourceEvent, { foreignKey: 'customerAccountKey' });
DB.ResourceEvent.belongsTo(DB.CustomerAccount, { foreignKey: 'customerAccountKey' });

DB.Resource.hasMany(DB.ResourceEvent, { foreignKey: 'resourceKey' });
DB.ResourceEvent.belongsTo(DB.Resource, { foreignKey: 'resourceKey' });

DB.ResourceGroup.hasMany(DB.ResourceEvent, { foreignKey: 'resourceGroupKey' });
DB.ResourceEvent.belongsTo(DB.ResourceGroup, { foreignKey: 'resourceGroupKey' });

DB.AlertTargetGroup.hasMany(DB.AlertTargetSubGroup, { foreignKey: 'alertTargetGroupKey' });
DB.AlertTargetSubGroup.belongsTo(DB.AlertTargetGroup, { foreignKey: 'alertTargetGroupKey' });

DB.AlertTargetSubGroup.hasMany(DB.AlertEasyRule, { foreignKey: 'alertTargetSubGroupKey' });
DB.AlertEasyRule.belongsTo(DB.AlertTargetSubGroup, { foreignKey: 'alertTargetSubGroupKey' });

DB.ResourceGroup.hasMany(DB.AlertEasyRule, { foreignKey: 'resourceGroupKey' });
DB.AlertEasyRule.belongsTo(DB.ResourceGroup, { foreignKey: 'resourceGroupKey' });

DB.PartyUser.hasMany(DB.PartyUserPassword, { foreignKey: 'partyUserKey' });
DB.PartyUserPassword.belongsTo(DB.PartyUser, { foreignKey: 'partyUserKey' });

DB.CustomerAccount.hasMany(DB.ResolutionAction, { foreignKey: 'customer_account_key' });
DB.ResolutionAction.belongsTo(DB.CustomerAccount, { foreignKey: 'customer_account_key' });

DB.Resource.hasMany(DB.AnomalyMonitoringTarget, { foreignKey: 'resource_key' });
DB.AnomalyMonitoringTarget.belongsTo(DB.Resource, { foreignKey: 'resource_key' });

DB.Resource.hasMany(DB.AnomalyMonitoringTargetResource, { foreignKey: 'resource_key' });
DB.AnomalyMonitoringTargetResource.belongsTo(DB.Resource, { foreignKey: 'resource_key' });

//-----------------------------BE-CAREFULL------------------------------------
// below script is used to create table again with new model structure and data
//[[force: true]]  is used when changes made in database.
//[[force: false]] there would be no database change even you modify the models.
//                 Need to have a separate operation to apply database model change.

DB.sequelize
  .sync({ force: false })
  .then(async () => {
    const trigger1pre = 'DROP TRIGGER IF EXISTS nc_api.tr_AlertReceivedHash;';
    const trigger2pre = 'DROP TRIGGER IF EXISTS nc_api.tr_AlertReceivedCreatedAt;';

    const trigger1 =
      'CREATE TRIGGER nc_api.tr_AlertReceivedHash BEFORE INSERT ON nc_api.AlertReceived FOR EACH ROW SET NEW.alert_received_hash = SHA1(CONCAT(NEW.alert_rule_key, NEW.alert_received_namespace, NEW.alert_received_node, NEW.alert_received_service, NEW.alert_received_pod, NEW.alert_received_affected_resource_type,  NEW.alert_received_affected_resource_name ));';
    const trigger2 =
      'CREATE TRIGGER nc_api.tr_AlertReceivedCreatedAt BEFORE INSERT ON nc_api.AlertReceived FOR EACH ROW SET NEW.alert_received_ui_flag = mod(minute(NEW.created_at),10); ';

    const sp1pre = `DROP PROCEDURE IF EXISTS nc_api.sp_create_resolved;`;
    const sp2pre = `DROP PROCEDURE IF EXISTS nc_api.sp_upsertSudoryTemplate;`;
    const sp3pre = `DROP PROCEDURE IF EXISTS nc_api.sp_deleteAlertReceived;`;

    const sp1 = `
        CREATE PROCEDURE IF NOT EXISTS nc_api.sp_upsertSudoryTemplate() 
        BEGIN
        INSERT INTO nc_api.SudoryTemplate (
        sudory_template_id,
        created_by,
        created_at,
        sudory_template_name,
        sudory_template_description,
        sudory_template_uuid,
        sudory_template_args
        )
        SELECT
        UUID(),
        'SYSTEM',
        NOW(),
        A.name as sudory_template_name,
        A.summary as sudory_template_description,
        A.uuid,
        B.args as sudory_template_args
        FROM nc_sudory.template A, nc_sudory.template_command B
        WHERE A.uuid = B.template_uuid
        ON DUPLICATE KEY UPDATE
        updated_by = 'SYSTEM',
        updated_at = NOW(),
        sudory_template_name = values(sudory_template_name),
        sudory_template_description = values(sudory_template_description),
        sudory_template_args = values(sudory_template_args)
        ;
        UPDATE nc_api.SudoryTemplate
        SET subscribed_channel = 'nc_resource'
        WHERE sudory_template_uuid like '0%' and subscribed_channel = "";
        UPDATE nc_api.SudoryTemplate
        SET subscribed_channel = 'nc_alert'
        WHERE sudory_template_uuid IN ('10000000000000000000000000000003', '10000000000000000000000000000004') and subscribed_channel = "";
        UPDATE nc_api.SudoryTemplate
        SET subscribed_channel = 'nc_metric'
        WHERE sudory_template_uuid IN ('10000000000000000000000000000006', '10000000000000000000000000000007') and subscribed_channel = "";
        UPDATE nc_api.SudoryTemplate
        SET subscribed_channel = 'nc_metric_received'
        WHERE sudory_template_uuid IN ('10000000000000000000000000000001', '10000000000000000000000000000002') and subscribed_channel = "";
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'PD'
        WHERE sudory_template_name like 'kubernetes_pods%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'NS'
        WHERE sudory_template_name like 'kubernetes_namespaces%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'CM'
        WHERE sudory_template_name like 'kubernetes_configmap%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'ND'
        WHERE sudory_template_name like 'kubernetes_node%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'PV'
        WHERE sudory_template_name like 'kubernetes_persistentvolumes_%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'PC'
        WHERE sudory_template_name like 'kubernetes_persistentvolumeclaims_%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'SV'
        WHERE sudory_template_name like 'kubernetes_service%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'EP'
        WHERE sudory_template_name like 'kubernetes_endpoint_%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'DP'
        WHERE sudory_template_name like 'kubernetes_deploy%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'IG'
        WHERE sudory_template_name like 'kubernetes_ingress_%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'SE'
        WHERE sudory_template_name like 'kubernetes_secret%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'SC'
        WHERE sudory_template_name like 'kubernetes_storage%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'SS'
        WHERE sudory_template_name like 'kubernetes_stateful%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'CJ'
        WHERE sudory_template_name like 'kubernetes_cronjob%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'RS'
        WHERE sudory_template_name like 'kubernetes_replica%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'JO'
        WHERE sudory_template_name like 'kubernetes_job%' and (resource_type is null OR resource_type = '');
        UPDATE nc_api.SudoryTemplate
        SET resource_type = 'DS'
        WHERE sudory_template_name like 'kubernetes_daemon%' and (resource_type is null OR resource_type = '');
                                                                
        END;
    `;

    const sp2 = `
        CREATE PROCEDURE IF NOT EXISTS nc_api.sp_deleteAlertReceived()
        BEGIN
            DECLARE counter INT DEFAULT 1;
            REPEAT
                delete from nc_api.AlertReceived
                where alert_received_key not in (select alert_received_key from nc_api.IncidentAlertReceived) 
                and UNIX_TIMESTAMP(created_at) < UNIX_TIMESTAMP(NOW() - INTERVAL 1 DAY)
                  limit 100000; commit;
                SET counter = counter + 1;
                SELECT SLEEP(2);
            UNTIL counter >= 200
            END REPEAT;
        END;
    `;

    const sp3 = `
        CREATE PROCEDURE IF NOT EXISTS nc_api.sp_create_resolved()
        BEGIN
            DECLARE EXIT HANDLER FOR SQLEXCEPTION 
            BEGIN
                  ROLLBACK;
            END;
            START TRANSACTION;
                INSERT INTO nc_api.AlertReceived
                    (
                    alert_received_id,
                    customer_account_key,
                    alert_rule_key,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at,
                    alert_received_name,
                    alert_received_value,
                    alert_received_state,
                    alert_received_namespace,
                    alert_received_severity,
                    alert_received_description,
                    alert_received_summary,
                    alert_received_active_at,
                    alert_received_node,
                    alert_received_service,
                    alert_received_pod,
                    alert_received_instance,
                    alert_received_labels,
                    alert_received_pinned,
                    alert_received_container,
                    alert_received_endpoint,
                    alert_received_reason,
                    alert_received_uid,
                    alert_received_hash,
                    alert_received_ui_flag,
                    alert_received_affected_resource_name,
                    alert_received_affected_resource_type
                    )
                SELECT 
                    UUID(), /* alert_received_id */
                    customer_account_key,
                    alert_rule_key,
                    created_by,
                    created_by, /* updated_by */
                    created_at,
                    current_timestamp(), /* updated_at */
                    alert_received_name,
                    alert_received_value,
                    'resolved', /* alert_received_state */
                    alert_received_namespace,
                    alert_received_severity,
                    alert_received_description,
                    alert_received_summary,
                    alert_received_active_at,
                    alert_received_node,
                    alert_received_service,
                    alert_received_pod,
                    alert_received_instance,
                    alert_received_labels,
                    alert_received_pinned,
                    alert_received_container,
                    alert_received_endpoint,
                    alert_received_reason,
                    alert_received_uid,
                    alert_received_hash,
                    0, /* alert_received_ui_flag */
                    alert_received_affected_resource_name,
                    alert_received_affected_resource_type
                FROM AlertReceived 
                WHERE deleted_at IS NULL
                AND alert_received_state = 'firing'
                AND created_at <= NOW() - INTERVAL 5 MINUTE;

                UPDATE nc_api.AlertReceived 
                SET 
                    deleted_at = current_timestamp(), 
                    updated_at = current_timestamp(),
                    updated_by =  AlertReceived.created_by
                WHERE deleted_at IS NULL
                AND alert_received_state = 'firing'
                AND created_at <= NOW() - INTERVAL 5 MINUTE;
            COMMIT;
        END;
    `;
    const event1pre = `DROP EVENT IF EXISTS nc_api.ev_sp_upsertSudoryTemplate;`;
    const event1 = `CREATE EVENT nc_api.ev_sp_upsertSudoryTemplate
                    ON SCHEDULE EVERY '1' DAY
                    STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY)
                    DO CALL nc_api.sp_upsertSudoryTemplate();`;
    const event2pre = `DROP EVENT IF EXISTS nc_api.ev_sp_deleteAlertReceived;`;
    const event2 = `CREATE EVENT nc_api.ev_sp_deleteAlertReceived 
                    ON SCHEDULE EVERY 1 DAY 
                    STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 1 HOUR)
                    DO CALL nc_api.sp_deleteAlertReceived()`;
    const event3pre = `DROP EVENT IF EXISTS nc_api.ev_sp_create_resolved;`;
    const event3 = `CREATE EVENT nc_api.ev_sp_create_resolved
                    ON SCHEDULE EVERY 5 MINUTE
                    DO CALL nc_api.sp_create_resolved();`;

    await sequelize.query(trigger1pre);
    await sequelize.query(trigger2pre);
    sequelize.query(trigger1);
    sequelize.query(trigger2);
    await sequelize.query(sp1pre);
    await sequelize.query(sp2pre);
    await sequelize.query(sp3pre);
    sequelize.query(sp1);
    sequelize.query(sp2);
    sequelize.query(sp3);
    await sequelize.query(event1pre);
    await sequelize.query(event2pre);
    await sequelize.query(event3pre);
    sequelize.query(event1);
    sequelize.query(event2);
    sequelize.query(event3);

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
