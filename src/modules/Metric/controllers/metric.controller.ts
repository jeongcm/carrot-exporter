import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import MetricService from '../services/metric.service';

class MetricController {
  public metricService = new MetricService();

  public getMetric = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const queryBody = req.body;
      const findMetricData = await this.metricService.getMetric(customerAccountKey, queryBody);
      res.status(200).json({ data: findMetricData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
}

export default MetricController;
