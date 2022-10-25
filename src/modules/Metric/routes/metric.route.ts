/*
Alert Routes

Notion:
https://www.notion.so/nexclipper/Alert-Feature-Design-dcdd6130e1bf4f05a8333a2b31a5756c
*/
import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { MetricMetaDto } from '../dtos/metricMeta.dto';
import ChartController from '../controllers/chart.controller';
import MetricController from '../controllers/metric.controller';
import MetricMetaController from '../controllers/metricMeta.controller';
import MetricReceivedController from '../controllers/metricReceived.controller';
import { MetricReceivedDto } from '../dtos/metricReceived.dto';
class MetricRoute implements Routes {
  public router = Router();
  public metricController = new MetricController();
  public metricMetaController = new MetricMetaController();
  public metricReceivedController = new MetricReceivedController();
  private chartController = new ChartController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/metric', authMiddleware, this.metricController.getMetric);
    this.router.post('/metric/p8s', authMiddleware, this.metricController.getMetricP8S);

    this.router.get('/chart', authMiddleware, this.chartController.getAllCharts);
    this.router.get('/chart/:resourceGroupId', authMiddleware, this.chartController.getResourceGroupChart);
    this.router.put('/chart/:resourceGroupId', authMiddleware, this.chartController.upsertResourceGroupChart);

    this.router.post('/metric/meta', authMiddleware, validationMiddleware(MetricMetaDto, 'body'), this.metricMetaController.createMetricMeta);
    this.router.get('/metric/meta', authMiddleware, this.metricMetaController.getMetricMeta);
    this.router.get('/metric/meta/resourceGroup/:resourceGroupId', authMiddleware, this.metricMetaController.getDistinctJobOfMetricMetabyResourceGroupId);
    this.router.put(
      '/metric/meta/:metricMetaId',
      authMiddleware,
      validationMiddleware(MetricMetaDto, 'body'),
      this.metricMetaController.updateMetricMeta,
    );
    this.router.delete('/metric/meta/:metricMetaId', authMiddleware, this.metricMetaController.deleteMetricMeta);
    this.router.post(
      '/metric/received',
      authMiddleware,
      validationMiddleware(MetricReceivedDto, 'body'),
      this.metricReceivedController.createMetricReceived,
    );
    this.router.get('/metric/received', authMiddleware, this.metricReceivedController.getMetricReceived);
    this.router.get('/resource/:resourceId/metric/received', authMiddleware, this.metricReceivedController.getMetricReceivedByResourceId);
    this.router.put(
      '/metric/received/:metricReceivedId',
      authMiddleware,
      validationMiddleware(MetricReceivedDto, 'body'),
      this.metricReceivedController.updateMetricReceived,
    );
    this.router.delete('/metric/received/:metricReceivedId', authMiddleware, this.metricReceivedController.deleteMetricReceived);
    this.router.post('/metric/upload/:resourceType', authMiddleware, this.metricController.uploadResource)
  }
}

export default MetricRoute;
