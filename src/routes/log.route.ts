import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import LogController from '@/controllers/log.controller';
import AuthService from '@/services/auth.service';
import authMiddleware from '@middlewares/auth.middleware';


class LogRoute implements Routes {
  public router = Router();
  public logController = new LogController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/logs',authMiddleware, this.logController.getLogs);
    this.router.get('/logs/:id',authMiddleware, this.logController.getLog);
  }
}

export default LogRoute;
