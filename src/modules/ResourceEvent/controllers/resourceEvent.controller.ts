import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem } from '@/common/interfaces/party.interface';
import ResourceEventService from '@/modules/ResourceEvent/services/resourceEvent.service';


class resourceEventController{

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

}

export default resourceEventController;