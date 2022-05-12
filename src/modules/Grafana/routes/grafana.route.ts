import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import GrafanaController from '@/modules/Grafana/controllers/grafana.controller';

class GrafanaRoute implements Routes {
  public router = Router();
  public grafanaController = new GrafanaController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/grafana/sso/login', authMiddleware, this.grafanaController.getGrafanaLoginCode);
    this.router.post('/grafana/sso/token', authMiddleware, this.grafanaController.issueGrafanaToken);
    this.router.get('/grafana/sso/auth', authMiddleware, this.grafanaController.verifyGrafanaToken);
  }
}

export default GrafanaRoute;
