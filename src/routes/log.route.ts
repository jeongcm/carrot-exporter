import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import LogController from '@/controllers/log.controller';
import AuthService from '@/services/auth.service';

class LogRoute implements Routes {
  public router = Router();
  public logController = new LogController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/logs', this.authservice.authenticate, this.logController.getLogs);
    this.router.get('/logs/:id', this.authservice.authenticate, this.logController.getLog);
  }
}

export default LogRoute;
