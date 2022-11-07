import { NextFunction, Response } from 'express';
import { IRequestWithSystem } from '@/common/interfaces/party.interface';
import massUploaderService from '@/modules/CommonService/services/massUploader.service';

class massUploaderController {
  public massUploaderService = new massUploaderService();

  public massUploadForResource = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    try {
      const resourceMassFeed = req.body;

      const massFeedResult = await this.massUploaderService.massUploadResource(resourceMassFeed);

      if (!massFeedResult) {
        return res.sendStatus(500);
      }

      res.status(200).json({ data: massFeedResult, message: `bulk data feed is successfully complete` });
    } catch (error) {
      next(error);
    }
  };

}

export default massUploaderController;
