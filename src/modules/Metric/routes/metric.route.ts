import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ResourceController from "@modules/Resources/controllers/resource.controller";
import MetricReceivedController from "@modules/Metric/controllers/metricReceived.controller";
import MetricMetaController from "@modules/Metric/controllers/metricMeta.controller";

class MetricRoute implements Routes {

  public router = Router();
  public metricReceivedController = new MetricReceivedController()
  public metricMetaController = new MetricMetaController()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/metricReceived', this.metricReceivedController.uploadMetricReceived)
    this.router.post('/metricReceived/ncp', this.metricReceivedController.uploadMetricReceivedNcp)
    this.router.post('/metricMeta', this.metricMetaController.uploadMetricMeta)
  }
}

export default MetricRoute;
