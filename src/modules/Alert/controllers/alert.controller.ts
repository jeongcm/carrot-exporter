import { NextFunction, Request, Response } from 'express';
import AlertRuleService from "@modules/Alert/services/alertRule.service";

class AlertController {
  alertRuleService = new AlertRuleService()

  public uploadAlertRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalMsg = req.body;
      const result = await this.alertRuleService.uploadAlertRule(totalMsg);

      res.status(200).json({ message: result });
    } catch (err) {
      next(err);
    }
  };
}

export default AlertController;
