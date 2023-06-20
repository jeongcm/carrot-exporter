import { NextFunction, Request, Response } from 'express';
import ResourceService from '@modules/Resources/services/resource.service';
import NcpResourceService from '@modules/Resources/services/ncp/resourceManager.service';

class ResourceController {
  public resourceService = new ResourceService();
  public ncpResourceService = new NcpResourceService();

  public uploadResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      const result = await this.resourceService.uploadResource(totalMsg);
      if (result === 'empty list') {
        res.status(204).json({ message: result });
        return;
      }

      res.status(200).json({ message: result });
    } catch (err) {
      next(err);
    }
  };

  public uploadResourceEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      const result = await this.resourceService.uploadResourceEvent(totalMsg);
      if (result === 'empty list') {
        res.status(204).json({ message: result });
        return;
      }

      res.status(200).json({ message: result });
    } catch (err) {
      next(err);
    }
  }; 
  
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
  
  public uploadNcpResourceGroupRelation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      const result = await this.ncpResourceService.uploadNcpResourceGroupRelation(totalMsg);
       
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

export default ResourceController;
