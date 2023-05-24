import './dotenvConfig';
import App from './app';
import ResourceRoute from '@modules/Resources/routes/resource.route';
import MetricRoute from './modules/Metric/routes/metric.route';
import NcpRoute from '@modules/Resources/routes/ncp/ncp.route';
import CostRoute from '@modules/Cost/routes/cost.route';
const app = new App([
  // new AlertRoute(),
  new ResourceRoute(),
  new MetricRoute(),
  new NcpRoute(),
  new CostRoute(),
]);

app.listen();

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log('Node NOW Exiting...');
});
