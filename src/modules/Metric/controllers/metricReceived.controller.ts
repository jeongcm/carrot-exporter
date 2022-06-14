import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import MetricMetaService from '../services/metricMeta.service';
import { MetricReceivedDto } from '../dtos/metricReceived.dto';
import MetricReceivedService from '../services/metricReceived.service';
import { IMetricReceived } from '@/common/interfaces/metricReceived.interface';

class MetricReceivedController {
  public metricMetaService = new MetricMetaService();
  public metricReceivedService = new MetricReceivedService();

  public getMetricReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findMetricReceived: IMetricReceived[] = await this.metricReceivedService.getMetricReceived(customerAccountKey);
      res.status(200).json({ data: findMetricReceived, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public deleteMetricReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const metricReceivedId: string = req.params.metricReceivedId;
      const customerAccountKey = req.customerAccountKey;
      const deletedFlag = await this.metricReceivedService.deleteMetricReceived(customerAccountKey, metricReceivedId);
      if (deletedFlag) {
        res.status(200).json({ data: deletedFlag, message: 'deleted' });
      } else {
        res.status(204).json({ data: deletedFlag, message: 'No Content' });
      }
    } catch (error) {
      next(error);
    }
  };

  public createMetricReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const {
        user: { partyId },
      } = req;
      const metricReceivedData: MetricReceivedDto = req.body;
      const createMetricReceivedData: IMetricReceived = await this.metricReceivedService.createMetricReceived(
        metricReceivedData,
        customerAccountKey,
        partyId,
      );
      res.status(201).json({ data: createMetricReceivedData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateMetricReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const metricReceivedId: string = req.params.metricReceivedId;
      const {
        user: { partyId },
      } = req;
      const metricReceivedData = req.body;
      const customerAccountKey = req.customerAccountKey;
      const updateMetricReceivedUpdate: IMetricReceived = await this.metricReceivedService.updateMetricReceived(
        metricReceivedId,
        metricReceivedData,
        customerAccountKey,
        partyId,
      );
      res.status(200).json({ data: updateMetricReceivedUpdate, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getMetricReceivedByResourceId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const resourceId = req.params.resourceId;
      let metricReceivedName = req.query.metricReceivedName;

      if (!Array.isArray(metricReceivedName)) {
        metricReceivedName = [metricReceivedName as string];
      }

      const findMetricData: IMetricReceived[] = await this.metricReceivedService.getMetricReceivedByResourceId(
        customerAccountKey,
        resourceId,
        metricReceivedName as string[],
      );
      res.status(200).json({ data: findMetricData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
}

export default MetricReceivedController;
