import 'dotenv/config';
import App from '@/app';
import AuthRoute from '@/modules/UserTenancy/routes/auth.route';
import IndexRoute from '@/modules/ApiGateway/routes/index.route';
import UsersRoute from '@/modules/UserTenancy/routes/users.route';
import AccessGroupRoute from '@/modules/Party/routes/accessgroup.route';
import TenancyRoute from '@/modules/UserTenancy/routes/tenancy.route';
import AlertRoute from '@/modules/Alert/routes/alert.route';
import LogRoute from '@/modules/Log/routes/log.route';
import ClusterRoute from '@/modules/K8s/routes/cluster.route';
import ChannelRoute from '@/modules/Messaging/routes/channel.route';
import IncidentRoute from '@/modules/Incident/routes/incident.route';

import ProductCatalogRoute from '@/modules/ProductCatalog/routes/productCatalog.route';
import MessageRoute from '@/modules/Messaging/routes/message.route';
import SubscriptionRoute from '@/modules/Subscriptions/routes/subscriptions.route';

import CommonCodeRoute from '@/modules/CommonCode/routes/commonCode.route';

import CustomerAccountRoute from '@modules/CustomerAccount/routes/customerAccount.route';
import TableIdRoute from '@/modules/CommonService/routes/tableId.route';
import webhookForBillingRoute from '@/modules/CommonService/routes/webhooforbilling.route';
import systemSubscription from '@/modules/CommonService/routes/systemSubscription.route';
import ApiRoute from '@/modules/Api/routes/api.route';
import PartyRoute from '@modules/Party/routes/party.route';

import NotificationRoute from './modules/Notification/routes/notification.route';
import PartyChannelRoute from './modules/Party/routes/partychannel.route';

import TopologyRoute from '@modules/Resources/routes/topology.route';

import ResourceRoute from '@modules/Resources/routes/resource.route';
import ResourceGroupRoute from '@modules/Resources/routes/resourceGroup.route';
import massUploaderRoute from './modules/CommonService/routes/massUploader.route';
import massUploaderMongoRoute from './modules/CommonService/routes/massUploaderMongo.route';

import InvitationRoute from './modules/Party/routes/invitation.route';
import MetricRoute from './modules/Metric/routes/metric.route';

import DiscountRoute from './modules/Billing/routes/discount.route';
import CouponRoute from './modules/Billing/routes/coupon.route';
import BillingAccountRoute from './modules/Billing/routes/billingAccount.route';
import PaymentTenderRoute from './modules/Billing/routes/paymentTender.route';
import BillingAccountDiscountRoute from './modules/Billing/routes/billingAccountDiscount.route';

import ExecutorRoute from './modules/CommonService/routes/executor.route';
import FileUploadRoute from './modules/CommonService/routes/fileUpload.route';
import GrafanaRoute from './modules/Grafana/routes/grafana.route';

import BayesianModelRoute from './modules/MetricOps/routes/bayesianModel.route';
import ResolutionActionRoute from './modules/MetricOps/routes/resolutionAction.route';
import SudoryTemplateRoute from './modules/MetricOps/routes/sudoryTemplate.route';
import RuleGroupRoute from './modules/MetricOps/routes/ruleGroup.route';
import RuleGroupAlertRoute from './modules/MetricOps/routes/ruleGroupAlertRule.route';
import AnomalyMonitoringTargetRoute from './modules/MetricOps/routes/monitoringTarget.route';
import RoleRoute from './modules/Role/routes/role.route';
import RolePartyRoute from './modules/Role/routes/roleParty.route';

const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  new AccessGroupRoute(),
  new AuthRoute(),
  new AlertRoute(),
  new LogRoute(),
  new TenancyRoute(),
  new ClusterRoute(),
  new ChannelRoute(),
  new IncidentRoute(),

  new ProductCatalogRoute(),
  new CustomerAccountRoute(),
  new ApiRoute(),
  new MessageRoute(),
  new SubscriptionRoute(),

  new CommonCodeRoute(),
  new CustomerAccountRoute(),
  new TableIdRoute(),
  new PartyRoute(),
  new NotificationRoute(),
  new PartyChannelRoute(),
  new ResourceRoute(),
  new ResourceGroupRoute(),

  new webhookForBillingRoute(),
  new systemSubscription(),
  new massUploaderRoute(),
  new massUploaderMongoRoute(),

  new InvitationRoute(),
  new MetricRoute(),
  new DiscountRoute(),
  new CouponRoute(),
  new BillingAccountRoute(),
  new PaymentTenderRoute(),
  new BillingAccountDiscountRoute(),
  new ExecutorRoute(),
  new FileUploadRoute(),
  new GrafanaRoute(),

  new BayesianModelRoute(),
  new ResolutionActionRoute(),
  new SudoryTemplateRoute(),
  new AnomalyMonitoringTargetRoute(),

  new TopologyRoute(),
  new RuleGroupRoute(),
  new RuleGroupAlertRoute(),
  new RoleRoute(),
  new RolePartyRoute(),
]);

app.listen();
