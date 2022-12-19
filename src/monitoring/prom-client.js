const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;

let register = new client.Registry();
// Prom Client Metrics

// Type 1 : Counter
const counter = new client.Counter({
  name: 'type_counter',
  help: 'Any Arbitary value to help identify this counter',
});

// Type 2 : Gauge
const gauge = new client.Gauge({
  name: 'type_gauge',
  help: 'Any Arbitary value to help identify this gauge',
});

// Type 3 : Histogram
const histogram = new client.Histogram({
  name: 'type_histogram',
  help: 'Any Arbitary value to help identify this histogram',
});

// type 4 : Summaries
const summary = new client.Summary({
  name: 'type_summary',
  help: 'Any Arbitary value to help identify this summary',
});

const httpMetricsLabelNames = ['method', 'path'];
const totalHttpRequestCount = new client.Counter({
  name: 'nodejs_http_total_count',
  help: 'total request number',
  labelNames: httpMetricsLabelNames,
});

const totalHttpRequestDuration = new client.Gauge({
  name: 'nodejs_http_total_duration',
  help: 'the last duration or response time of last request',
  labelNames: httpMetricsLabelNames,
});

const metrics = {
  counter,
  gauge,
  histogram,
  summary,
  totalHttpRequestCount,
  totalHttpRequestDuration,
};

register.registerMetric(metrics);
register.setDefaultLabels({ NODE_APP: process.env.NODE_APP_INSTANCE });
// Collect Promethues Default metrics
client.collectDefaultMetrics({ register });

module.exports = metrics;
