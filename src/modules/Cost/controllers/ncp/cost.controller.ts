import { NextFunction, Request, Response } from 'express';
import NcpCostService from '../../services/ncpCost.service';
import QueryService from '@/modules/Resources/query/query';

class CostController {
  public ncpCostService = new NcpCostService();
  public queryService = new QueryService();

  public uploadNcpCost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      let queryResult;
      const totalMsg = req.body;
      let result: any;
      // queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);
      // template_uuid로 서비스 분기 처리.
      if (totalMsg.template_uuid === '70000000000000000000000000000040') {
        result = await this.ncpCostService.uploadNcpContractDemandCost(totalMsg);
      } else if (totalMsg.template_uuid === '70000000000000000000000000000041') {
        result = await this.ncpCostService.uploadNcpDemandCost(totalMsg);
      } else if (totalMsg.template_uuid === '70000000000000000000000000000042') {
        result = await this.ncpCostService.uploadNcpContractUsage(totalMsg);
      } else if (totalMsg.template_uuid === '70000000000000000000000000000043') {
        result = await this.ncpCostService.uploadNcpProductPrice(totalMsg);
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

export default CostController;
