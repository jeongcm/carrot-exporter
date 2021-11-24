process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import AccessGroupRoute from '@routes/accessGroup.route';
import TenancyRoute from '@routes/tenancy.route';
import AlertRoute from '@routes/alert.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  new AccessGroupRoute(),
  new AuthRoute(),
  new TenancyRoute(), //
  new AlertRoute(),
]);

app.listen();
