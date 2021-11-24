import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import AlertController from '@/controllers/alert.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateAlertDto } from '@dtos/alert.dto';

class AlertRoute implements Routes {
  public path = '/alerts';
  public router = Router();
  public alertController = new AlertController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.alertController.getAlerts);
    this.router.get(`${this.path}/:id`, this.alertController.getAlert);
    this.router.post(`${this.path}`, validationMiddleware(CreateAlertDto, 'body'), this.alertController.createAlert);
    this.router.delete(`${this.path}/:id`, this.alertController.deleteAlert);
  }
}

export default AlertRoute;
