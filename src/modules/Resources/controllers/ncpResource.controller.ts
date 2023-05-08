import { NextFunction, Request, Response } from 'express';
import NcpResourceService from '@modules/Resources/services/ncpResource.service';

class NcpResourceController {
  public ncpResourceService = new NcpResourceService();

  public uploadNcpResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      const result = await this.ncpResourceService.uploadNcpResource(totalMsg);
      if (result === 'empty list') {
        res.status(204).json({ message: result });
        return;
      }

      res.status(200).json({ message: result });
    } catch (err) {
      next(err);
    }
  };
}

export default NcpResourceController;
