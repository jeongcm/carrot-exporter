import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ResourceController from "@modules/Resources/controllers/resource.controller";
import MetricReceivedController from "@modules/Metric/controllers/metricReceived.controller";

class MetricRoute implements Routes {

  public router = Router();
  public metricReceivedController = new MetricReceivedController()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/metricReceived', this.metricReceivedController.uploadMetricReceived)
    this.router.post('/metricReceived/ncp', this.metricReceivedController.uploadMetricReceivedNcp)
  }
}

export default MetricRoute;
