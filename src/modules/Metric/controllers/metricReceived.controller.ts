import { NextFunction, Request, Response } from 'express';
import MetricReceivedService from "@modules/Metric/services/metricReceived.service";

class MetricReceivedController {
  public metricReceivedService = new MetricReceivedService()

  public uploadMetricReceived = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body
      const result = await this.metricReceivedService.massUploadMetricReceived(totalMsg)
      res.status(200).json({ message: result });
    } catch (err) {
      next(err)
    }
  }

  public uploadMetricReceivedNcp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body
      const result = await this.metricReceivedService.massUploadMetricReceivedNcp(totalMsg)
      res.status(200).json({ message: result });
    } catch (err) {
      next(err)
    }
  }
}

export default MetricReceivedController;
