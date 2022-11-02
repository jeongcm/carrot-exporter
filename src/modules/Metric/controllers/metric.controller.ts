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

  // this need for upload resource, because of resource that sudory doesn't provide
  public uploadResource = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const queryBody = req.body;
      const customerAccountKey = req.body.customerAccountKey

      let result: any = null;
      switch (req.params.resourceType) {
        case "PM":
          result = await this.metricService.uploadResourcePM(customerAccountKey, queryBody);
      }
      res.status(200).json({ data: result, message: `upload Resource` });
    } catch (error) {
      next(error);
    }
  };

  public getMetricP8S = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      let findMetricData: any = {};

      const customerAccountKey = req.customerAccountKey;
      const queryBody = req.body;

      switch (queryBody.query[0].type) {
        case "VM_METRICS":
          findMetricData = await this.metricService.getMetricP8SVM(customerAccountKey, queryBody);
          break;
        case "PM_METRICS":
          findMetricData = await this.metricService.getMetricP8SPM(customerAccountKey, queryBody);
          break;
        default:
          findMetricData = await this.metricService.getMetricP8S(customerAccountKey, queryBody);
      }

      res.status(200).json({ data: findMetricData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
}

export default MetricController;
