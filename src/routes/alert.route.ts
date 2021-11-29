import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import AlertController from '@/controllers/alert.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateAlertDto } from '@dtos/alert.dto';
import AuthService from '@/services/auth.service';

class AlertRoute implements Routes {
  public path = '/alerts';
  public router = Router();
  public alertController = new AlertController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.authservice.authenticate, this.alertController.getAlerts);
    this.router.get(`${this.path}/:id`, this.authservice.authenticate, this.alertController.getAlert);
    this.router.post(`${this.path}`, this.authservice.authenticate, validationMiddleware(CreateAlertDto, 'body'), this.alertController.createAlert);
    this.router.delete(`${this.path}/:id`, this.authservice.authenticate, this.alertController.deleteAlert);
  }
}

export default AlertRoute;
