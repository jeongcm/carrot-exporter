import config from '@/config';
import express from 'express';
import client from 'prom-client';

const app = express();
export const restResponseTimeHistogram = new client.Histogram({
  name: 'rest_response_time_duration_seconds',
  help: 'REST API response time in seconds',
  labelNames: ['method', 'route', 'status_code'],
});
// need to be coded to capture db response time
export const databaseResponseTimeHistogram = new client.Histogram({
  name: 'db_response_time_duration_seconds',
  help: 'Database response time in seconds',
  labelNames: ['operation', 'success'],
});

export function startMetricsServer() {
  //  const register = new client.Registry();
  //custom metrics
  /*
  const httpMetricsLabelNames = ['method', 'path'];
  const totalHttpRequestCount = new client.Counter({
    name: 'nodejs_http_total_count',
    help: 'total request number',
    labelNames: httpMetricsLabelNames,
  });
  register.registerMetric(totalHttpRequestCount);
  register.setDefaultLabels({ NODE_APP: process.env.NODE_APP_INSTANCE });
*/
  //const collectDefaultMetrics = client.collectDefaultMetrics({ register });
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  app.get('/metrics', async (req, res) => {
    res.set('Content-type', client.register.contentType);
    return res.send(await client.register.metrics());
  });
  app.listen(Number(config.metricPort), () => {
    console.log('Metric Server started at 5100 port');
  });
  //end of Prometheus Exporter
}
