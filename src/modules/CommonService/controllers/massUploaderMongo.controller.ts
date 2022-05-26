import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem } from '@/common/interfaces/party.interface';
import massUploaderMongoService from '@/modules/CommonService/services/massUploaderMongo.service';

class massUploaderMongoController{

    public massUploaderMongoService = new massUploaderMongoService();

    public massUploadMongoForResource = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
      try {
        const resourceMassFeed = req.body;
        const massFeedResult = await this.massUploaderMongoService.massUploadResourceMongo(resourceMassFeed);
        if (!massFeedResult) {
            return res.sendStatus(500);
          }
        res.status(200).json({ data: massFeedResult, message: `Bulk Resource feed - mongo is successfully complete` });
      } catch (error) {
        next(error);
      }
    };

}

export default massUploaderMongoController;