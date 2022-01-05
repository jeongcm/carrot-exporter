import { NextFunction, Request, Response } from 'express';
import { IAlert } from '@/interfaces/alert.interface';
import AlertService from '@/services/alert.service';
import { CreateAlertDto } from '@dtos/alert.dto';

class AlertController {
  public alertService = new AlertService();

  public getAlerts = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error
    const currentTenancyId = req.user.currentTenancyId;

    try {
      const allAlerts: IAlert[] = await this.alertService.getAllAlerts(currentTenancyId);
      res.status(200).json({ data: allAlerts, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAllPinnedAlerts = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error
    const currentTenancyId = req.user.currentTenancyId;

    try {
      const allPinnedAlerts: IAlert[] = await this.alertService.getAllPinnedAlerts(currentTenancyId);
      res.status(200).json({ data: allPinnedAlerts, message: 'findAllPinned' });
    } catch (error) {
      next(error);
    }
  };

  public getAlert = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);

    try {
      const alert: IAlert = await this.alertService.getAlertById(id);
      res.status(200).json({ data: alert, message: `find alert id(${id}) ` });
    } catch (error) {
      next(error);
    }
  };

  public createAlert = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error
    const currentTenancyId = req.user.currentTenancyId;

    try {
      const alertData: CreateAlertDto = req.body;
      const createAlertData: IAlert = await this.alertService.createAlert(alertData, currentTenancyId);
      res.status(201).json({ data: createAlertData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteAlert = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
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

  public updateAlertPin = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
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

  public deleteAlertPin = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
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
