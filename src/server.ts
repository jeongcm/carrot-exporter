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
<<<<<<< HEAD
import CommonCodeRoute from './modules/CommonCode/routes/commonCode.route';
=======
import CustomerAccountRoute from '@modules/CustomerAccount/routes/customerAccount.route';
import tableIdRoute from '@/modules/CommonService/routes/tableId.route';
>>>>>>> a453c6373231f0670d2077ae4ba7fcef542a68d0

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
<<<<<<< HEAD
  new CommonCodeRoute(),
=======
  new CustomerAccountRoute(),
  new tableIdRoute(),
>>>>>>> a453c6373231f0670d2077ae4ba7fcef542a68d0
]);

app.listen();
