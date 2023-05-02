import { NextFunction, Request, Response } from 'express';
import ResourceService from "@modules/Resources/services/resource.service";

class ResourceController {
  public resourceService = new ResourceService()

  public uploadResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body
      const result = await this.resourceService.uploadResource(totalMsg)
      res.status(200).json({ message: result });
    } catch (err) {
      next(err)
    }
  }
}

export default ResourceController;
