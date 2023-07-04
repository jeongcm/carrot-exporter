import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import AlertController from "@modules/Alert/controllers/alert.controller";

class AlertRoute implements Routes {
  public router = Router();
  public alertController = new AlertController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    // this.router.get('/alertRule', this.alertController.getAlertRule);
    // this.router.post('/alertReceived', this.alertController.uploadResource);
    this.router.post('/alertRule', this.alertController.uploadAlertRule);
    this.router.post('/v1/alertTimeline/:customerAccountKey/process', this.alertController.processAlertTimelines);

  }
}

export default AlertRoute;
