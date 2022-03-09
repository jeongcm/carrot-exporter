import { NextFunction, Request, Response } from 'express';
import { IAlert } from '@/common/interfaces/alert.interface';
import AlertService from '@/modules/Alert/services/alert.service';
import { CreateAlertDto, AlertListDto } from '@/modules/Alert/dtos/alert.dto';
import { RequestWithUser } from '@/common/interfaces/auth.interface';

class AlertController {
  public alertService = new AlertService();

  public getAlerts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const currentTenancyPk = req.user.currentTenancyPk;

    try {
      const allAlerts: AlertListDto[] = await this.alertService.getAllAlerts(currentTenancyPk);
      res.status(200).json({ data: allAlerts, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAllPinnedAlerts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const currentTenancyPk = req.user.currentTenancyPk;

    try {
      const allPinnedAlerts: AlertListDto[] = await this.alertService.getAllPinnedAlerts(currentTenancyPk);
      res.status(200).json({ data: allPinnedAlerts, message: 'findAllPinned' });
    } catch (error) {
      next(error);
    }
  };

  public getAlert = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      const alert: IAlert = await this.alertService.getAlertById(id);
      res.status(200).json({ data: alert, message: `find alert id(${id}) ` });
    } catch (error) {
      next(error);
    }
  };

  public createAlert = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const currentTenancyPk = req.user.currentTenancyPk;

    try {
      const alertData: CreateAlertDto = req.body;
      const createAlertData: IAlert = await this.alertService.createAlert(alertData, currentTenancyPk);
      res.status(201).json({ data: createAlertData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteAlert = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const alert = await this.alertService.getAlertById(id);

    if (!alert) {
      return res.sendStatus(404);
    }

    try {
      await this.alertService.deleteAlertById(id);
      res.status(204).json({ message: `delete alert id(${id})` });
    } catch (error) {
      next(error);
    }
  };

  public updateAlertPin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const alert = await this.alertService.getAlertById(id);

    if (!alert) {
      return res.sendStatus(404);
    }

    try {
      await this.alertService.updateAlertPin(id);
      res.status(200).json({ message: `pin alert id(${id}) success.` });
    } catch (error) {
      next(error);
    }
  };

  public deleteAlertPin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const alert = await this.alertService.getAlertById(id);

    if (!alert) {
      return res.sendStatus(404);
    }

    try {
      await this.alertService.deleteAlertPin(id);
      res.status(200).json({ message: `unpin alert id(${id}) success.` });
    } catch (error) {
      next(error);
    }
  };
}

export default AlertController;
