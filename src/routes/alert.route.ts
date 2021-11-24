import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import AlertController from '@/controllers/alert.controller';

class AlertRoute implements Routes {
  public path = '/alerts';
  public router = Router();
  public alertController = new AlertController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.alertController.getAlerts);
  }
}

export default AlertRoute;
