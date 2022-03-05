/*
Alert Routes

Notion:
https://www.notion.so/nexclipper/Alert-Feature-Design-dcdd6130e1bf4f05a8333a2b31a5756c
*/
import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import AlertController from '@/controllers/alert.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateAlertDto } from '@dtos/alert.dto';
// import AuthService from '@/services/auth.service';
import authMiddleware from '@middlewares/auth.middleware';
class AlertRoute implements Routes {
  public router = Router();
  public alertController = new AlertController();
  // public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/alerts/pinned', authMiddleware, this.alertController.getAllPinnedAlerts);
    this.router.get('/alerts', authMiddleware, this.alertController.getAlerts);
    this.router.put('/alerts/pin/:id', authMiddleware, this.alertController.updateAlertPin);
    this.router.delete('/alerts/pin/:id', authMiddleware, this.alertController.deleteAlertPin);

    this.router.get('/alerts/:id', authMiddleware, this.alertController.getAlert);
    this.router.post('/alerts', authMiddleware, validationMiddleware(CreateAlertDto, 'body'), this.alertController.createAlert);
    this.router.delete('/alerts/:id', authMiddleware, this.alertController.deleteAlert);
  }
}

export default AlertRoute;
