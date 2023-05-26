import { NextFunction, Request, Response } from 'express';
import NcpCostService from '../../services/ncpCost.service';

class ResourceManagerController {
  public ncpCostService = new NcpCostService();

  public uploadNcpCost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      let result: any;
      //template_uuid로 서비스 분기 처리.
      if (totalMsg.template_uuid === '70000000000000000000000000000040') {
        result = await this.ncpCostService.uploadNcpContractDemandCost(totalMsg);
      } else if (totalMsg.template_uuid === '70000000000000000000000000000041') {
        result = await this.ncpCostService.uploadNcpDemandCost(totalMsg);
      } else if (totalMsg.template_uuid === '70000000000000000000000000000042') {
        result = await this.ncpCostService.uploadNcpContractUsage(totalMsg);
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
