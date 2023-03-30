import './dotenvConfig';
import App from './app';
// import AlertRoute from '@/modules/Alert/routes/alert.route';
// import ResourceRoute from '@modules/Resources/routes/resource.route';
// import massUploaderRoute from './modules/CommonService/routes/massUploader.route';
// import massUploaderMongoRoute from './modules/CommonService/routes/massUploaderMongo.route';
// import MetricRoute from './modules/Metric/routes/metric.route';

const app = new App([
  // new AlertRoute(),
  // new ResourceRoute(),
  // new massUploaderRoute(),
  // new massUploaderMongoRoute(),
  // new MetricRoute(),
]);

app.listen();


process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log('Node NOW Exiting...');
});
