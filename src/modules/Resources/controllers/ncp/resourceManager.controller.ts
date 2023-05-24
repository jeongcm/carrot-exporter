import { NextFunction, Request, Response } from 'express';
import NcpResourceService from '@modules/Resources/services/ncp/resourceManager.service';

class ResourceManagerController {
  public ncpResourceService = new NcpResourceService();

  public uploadNcpResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      let result: any;
      //template_uuid로 서비스 분기 처리.
      if (totalMsg.template_uuid === '70000000000000000000000000000029') {
        result = await this.ncpResourceService.uploadNcpResource(totalMsg);
      } else if (totalMsg.template_uuid === '70000000000000000000000000000030') {
        result = await this.ncpResourceService.uploadNcpResourceGroupRelation(totalMsg);
      } else if (totalMsg.template_uuid === 'NCM00000000000000000000000000014') {
        result = await this.ncpResourceService.uploadNcpResourceGroupRelation(totalMsg);
      }

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

export default ResourceManagerController;
