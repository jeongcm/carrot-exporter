import { NextFunction, Request, Response } from 'express';
import AlertRuleService from "@modules/Alert/services/alertRule.service";
import MetricMetaService from "@modules/Metric/services/metricMeta.service";

class MetricMetaController {
  metricMetaService = new MetricMetaService()

  public uploadMetricMeta = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      const result = await this.metricMetaService.uploadMetricMeta(totalMsg);

      res.status(200).json({ message: result });
    } catch (err) {
      next(err);
    }
  };
}

export default MetricMetaController;
