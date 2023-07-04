import { NextFunction, Request, Response } from 'express';
import AlertRuleService from "@modules/Alert/services/alertRule.service";
import AlertTimelineService from "@modules/Alert/services/alertTimeline.service";

class AlertController {
  alertRuleService = new AlertRuleService()
  alertTimelineService = new AlertTimelineService()

  public uploadAlertRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      const result = await this.alertRuleService.uploadAlertRule(totalMsg);

      res.status(200).json({ message: result });
    } catch (err) {
      next(err);
    }
  };

  public processAlertTimelines = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerAccountKey } = req.params;
      const alertTimelines = await this.alertTimelineService.processAlertTimeline(Number(customerAccountKey));
      res.status(200).json({ data: alertTimelines, message: 'success' });
    } catch (error) {
      next(error);
    }
  };
}

export default AlertController;
