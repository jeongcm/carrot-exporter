import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import AnomalyMonitoringTargetService from '../services/monitoringTarget.service';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { CreateMonitoringTargetDto, UpdateMonitoringTargetDto } from '../dtos/monitoringTarget.dto';

class AnomalyMonitoringTargetController {
  public anomalyMonitoringTargetService = new AnomalyMonitoringTargetService();

  public getAllMonitoringTarget = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const monitoringTargetList: IAnomalyMonitoringTarget[] = await this.anomalyMonitoringTargetService.findAllMonitoringTargets();
      res.status(200).json({ data: monitoringTargetList, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public createMonitoringTarget = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { user: { partyId } = {}, systemId, customerAccountKey } = req;
      const monitoringTargetData: CreateMonitoringTargetDto = req.body;
      const newMonitoringData = await this.anomalyMonitoringTargetService.createMonitoringTarget(
        monitoringTargetData,
        systemId || partyId,
        customerAccountKey,
      );
      res.status(201).json({ data: newMonitoringData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateMonitoringTarget = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { user: { partyId } = {}, params: { anomalyMonitoringTargetId } = {} } = req;
      const AnomalyMonitoringTargetData: UpdateMonitoringTargetDto = req.body;
      //const customerAccountKey: number = req.customerAccountKey;
      const updatedTargetData: IAnomalyMonitoringTarget = await this.anomalyMonitoringTargetService.updateMonitoringTarget(
        anomalyMonitoringTargetId,
        AnomalyMonitoringTargetData,
        partyId,
      );
      res.status(200).json({ data: updatedTargetData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getMonitoringTargetById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
        params: { anomalyMonitoringTargetId },
      } = req;
      const monitoringTargetData: IAnomalyMonitoringTarget = await this.anomalyMonitoringTargetService.findMonitoringTargetById(
        anomalyMonitoringTargetId,
      );
      res.status(200).json({ data: monitoringTargetData, message: 'find' });
    } catch (error) {
      next(error);
    }
  };

  public getMonitoringTargetByResourceKey = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resourceKey = parseInt(req.params.resourceKey);
      const monitoringTargetData: IAnomalyMonitoringTarget = await this.anomalyMonitoringTargetService.findMonitoringTargetsByResourceKeys(
        resourceKey,
      );
      res.status(200).json({ data: monitoringTargetData, message: 'find' });
    } catch (error) {
      next(error);
    }
  };

  public deleteMonitoringTargetById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
        params: { anomalyMonitoringTargetId },
      } = req;
      const monitoringTargetData = await this.anomalyMonitoringTargetService.deleteMonitoringTarget(anomalyMonitoringTargetId, partyId);
      res.status(200).json({ data: monitoringTargetData, message: 'Remove target successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default AnomalyMonitoringTargetController;
