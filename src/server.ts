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
import InvitationRoute from '@/modules/UserTenancy/routes/invitation.route';

import ProductCatalogRoute from '@/modules/ProductCatalog/routes/productCatalog.route';
import MessageRoute from '@/modules/Messaging/routes/message.route';

import CommonCodeRoute from '@/modules/CommonCode/routes/commonCode.route';

import CustomerAccountRoute from '@modules/CustomerAccount/routes/customerAccount.route';
import tableIdRoute from '@/modules/CommonService/routes/tableId.route';
import ApiRoute from '@/modules/Api/routes/api.route';
import PartyRoute from '@modules/Party/routes/party.route';

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
  new InvitationRoute(),

  new ProductCatalogRoute(),
  new CustomerAccountRoute(),
  new tableIdRoute(),
  new ApiRoute(),
  new MessageRoute(),

  new CommonCodeRoute(),
  new CustomerAccountRoute(),
  new tableIdRoute(),
  new PartyRoute(),
]);

app.listen();
