import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { MetricMetaDto } from '../dtos/metricMeta.dto';
import MetricMetaService from '../services/metricMeta.service';
import { IMetricMeta } from '@/common/interfaces/metricMeta.interface';

class MetricMetaController {
  public metricMetaService = new MetricMetaService();

  public getMetricMeta = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findMetricData: IMetricMeta[] = await this.metricMetaService.getMetricMeta(customerAccountKey);
      res.status(200).json({ data: findMetricData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public deleteMetricMeta = async (req:IRequestWithUser, res:Response, next:NextFunction) => {
    try{
      const metricMetaId: string = req.params.metricMetaId;
      const customerAccountKey = req.customerAccountKey;
      const deletedFlag = await this.metricMetaService.deleteMetricMeta(customerAccountKey, metricMetaId);
      if (deletedFlag){
        res.status(200).json({ data: deletedFlag, message: 'deleted' });
      }else{
        res.status(204).json({ data: deletedFlag, message: 'No Content' });
      }
    }catch(error){
      next(error);
    }
  }

  public createMetricMeta = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const {
        user: { partyId },
      } = req;
      const metricMetaData: MetricMetaDto = req.body;
      const createMetricMetaData: IMetricMeta = await this.metricMetaService.createMetricMeta(metricMetaData, customerAccountKey, partyId);
      res.status(201).json({ data: createMetricMetaData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateMetricMeta = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const metricMetaId: string = req.params.metricMetaId;
      const {
        user: { partyId },
      } = req;
      const metricMetaData = req.body;
      const customerAccountKey = req.customerAccountKey;
      const updateMetricMetaUpdate: IMetricMeta = await this.metricMetaService.updateMetricMeta(
        metricMetaId,
        metricMetaData,
        customerAccountKey,
        partyId,
      );
      res.status(200).json({ data: updateMetricMetaUpdate, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getDistinctJobOfMetricMetabyResourceGroupId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resourceGroupId = req.params.resourceGroupId;
      const findMetricData: IMetricMeta[] = await this.metricMetaService.getDistinctJobOfMetricMetabyResourceGroupId(resourceGroupId);
      res.status(200).json({ data: findMetricData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };


}

export default MetricMetaController;
