import { NextFunction, Response } from 'express';
import { IRequestWithSystem } from '@/common/interfaces/party.interface';
import ResourceEventService from '@/modules/ResourceEvent/services/resourceEvent.service';

class resourceEventController {
  public resourceEventService = new ResourceEventService();

  public massUploadForResource = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    try {
      const resourceEventMassFeed = req.body;

      const massFeedResult = await this.resourceEventService.createResourceEventMass(resourceEventMassFeed);

      if (!massFeedResult) {
        return res.sendStatus(500);
      }

      res.status(200).json({ data: massFeedResult, message: `ResourceEvents - bulk data feed is successfully complete` });
    } catch (error) {
      next(error);
    }
  };

  public getResourceEventByResourceGroupUuid = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    try {
      const resourceGroupUuid = req.params.resourceGroupUuid;
      const limit = parseInt(req.params.limit) || 1000;
      const offset = parseInt(req.params.offset) || 0;

      const resourceEvent = await this.resourceEventService.getResourceEventByResourceGroupUuid(resourceGroupUuid, limit, offset);

      if (!resourceEvent) {
        return res.sendStatus(500);
      }

      res
        .status(200)
        .json({ data: resourceEvent, message: `ResourceEvents - pull events successfully ${resourceGroupUuid}, offset ${offset}, limit ${limit}` });
    } catch (error) {
      next(error);
    }
  };

  public getResourceEventByResourceId = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params.resourceId;
      const resourceEvent = await this.resourceEventService.getResourceEventByResourceId(resourceId);

      if (!resourceEvent) {
        return res.sendStatus(500);
      }

      res.status(200).json({ data: resourceEvent, message: `ResourceEvents - pull events successfully ${resourceId}` });
    } catch (error) {
      next(error);
    }
  };

  public getResourceEventById = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    try {
      const resourceEventId = req.params.resourceEventId;

      const resourceEvent = await this.resourceEventService.getResourceEventById(resourceEventId);

      if (!resourceEvent) {
        return res.sendStatus(500);
      }

      res.status(200).json({ data: resourceEvent, message: `ResourceEvent - pull event successfully ${resourceEventId}` });
    } catch (error) {
      next(error);
    }
  };
}

export default resourceEventController;
