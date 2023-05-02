import './dotenvConfig';
import App from './app';
import ResourceRoute from '@modules/Resources/routes/resource.route';
import MetricRoute from './modules/Metric/routes/metric.route';

const app = new App([
  // new AlertRoute(),
  new ResourceRoute(),
  new MetricRoute(),
]);

app.listen();


process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log('Node NOW Exiting...');
});
