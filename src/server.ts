import 'dotenv/config';
import App from '@/app';
import AuthRoute from '@/modules/UserTenancy/routes/auth.route';
import IndexRoute from '@/modules/ApiGateway/routes/index.route';
import UsersRoute from '@/modules/UserTenancy/routes/users.route';
import AccessGroupRoute from '@/modules/UserTenancy/routes/accessGroup.route';
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
import ApiRoute from '@/modules/Api/routes/api.route';
import PartyRoute from '@modules/Party/routes/party.route';

import NotificationRoute from './modules/Notification/routes/notification.route';
import PartyChannelRoute from './modules/Party/routes/partychannel.route';

import ResourceRoute from '@modules/Resources/routes/resource.route';
import ResourceGroupRoute from '@modules/Resources/routes/resourceGroup.route';
import massUploaderRoute from './modules/CommonService/routes/massUploader.route';

import InvitationRoute from './modules/Party/routes/invitation.route';


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
  new massUploaderRoute(),

  new InvitationRoute()
]);

app.listen();
