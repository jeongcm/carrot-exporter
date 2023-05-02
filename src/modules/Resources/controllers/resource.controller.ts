import { NextFunction, Request, Response } from 'express';
import ResourceService from "@modules/Resources/services/resource.service";
import ResourceEventService from "@modules/Resources/services/resourceEvent.service";
import { IRequestWithSystem } from "@common/interfaces/party.interface";

class ResourceController {
  public resourceService = new ResourceService()
  public resourceEventService = new ResourceEventService();

  public uploadResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body
      const result = await this.resourceService.uploadResource(totalMsg)
      res.status(200).json({ message: result });
    } catch (err) {
      next(err)
    }
  }

  public uploadResourceEvent = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    try {
      const resourceEventMassFeed = req.body;

      const massFeedResult = await this.resourceEventService.uploadResourceEvent(resourceEventMassFeed);

      if (!massFeedResult) {
        return res.sendStatus(500);
      }

      res.status(200).json({ data: massFeedResult, message: `ResourceEvents - bulk data feed is successfully complete` });
    } catch (error) {
      next(error);
    }
  };
}

export default ResourceController;
