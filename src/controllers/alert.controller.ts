import { NextFunction, Request, Response } from 'express';
import { IAlert } from '@/interfaces/alert.interface';
import AlertService from '@/services/alert.service';
import { CreateAlertDto } from '@dtos/alert.dto';

class AlertController {
  public alertService = new AlertService();

  public getAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllAlertsData: IAlert[] = await this.alertService.findAllAlerts();
      res.status(200).json({ data: findAllAlertsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public createAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alertData: CreateAlertDto = req.body;
      const createAlertData: IAlert = await this.alertService.createAlert(alertData);
      res.status(201).json({ data: createAlertData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default AlertController;
