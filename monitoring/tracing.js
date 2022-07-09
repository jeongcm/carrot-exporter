const process = require('process');

/*
// Require dependencies
//const opentelemetry = require('@opentelemetry/sdk-node');
//const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
//const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
//const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
//const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const exporter = new OTLPTraceExporter({
  // optional - url default value is http://localhost:4318/v1/traces
  url: 'http://ncotel-collector-opentelemetry-collector.otel.svc.local:4318/v1/traces',
  // optional - collection of custom headers to be sent with each request, empty by default
  headers: {}, 
});
const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});
*/

const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require("@opentelemetry/tracing");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");

const opentelemetry = require("@opentelemetry/sdk-node");
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
//const {getNodeAutoInstrumentations,} = require("@opentelemetry/auto-instrumentations-node");


const exporter = new OTLPTraceExporter({
  url: "http://ncotel-collector-opentelemetry-collector.otel.svc.cluster.local:4318/v1/traces"
});

const provider = new BasicTracerProvider({
  resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
          "nexclipper-api",
  }),
});

// export spans to console (useful for debugging)
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
// export spans to opentelemetry collector
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

const sdk = new opentelemetry.NodeSDK({
    traceExporter: exporter,
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

sdk
  .start()
  .then(() => console.log('Tracing initialized'))
  .catch(error => console.log('Error initializing tracing', error));

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch(error => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
