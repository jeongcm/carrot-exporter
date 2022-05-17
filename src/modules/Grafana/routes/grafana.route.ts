import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import GrafanaController from '@/modules/Grafana/controllers/grafana.controller';
import GrafanaSettingController from '@/modules/Grafana/controllers/grafanaSetting.controller';

class GrafanaRoute implements Routes {
  public router = Router();
  public grafanaController = new GrafanaController();
  public grafanaSettingController = new GrafanaSettingController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/grafana/sso/login', authMiddleware, this.grafanaController.getGrafanaLoginCode);
    this.router.post('/grafana/sso/token', this.grafanaController.issueGrafanaToken);
    this.router.get('/grafana/sso/auth', this.grafanaController.verifyGrafanaToken);

    this.router.get('/grafana/resourceGroup/:resourceGroupId/settings', this.grafanaSettingController.getGrafanaSetting);
    this.router.put('/grafana/resourceGroup/:resourceGroupId/settings', this.grafanaSettingController.updateGrafanaSetting);
    this.router.post('/grafana/resourceGroup/:resourceGroupId/settings', this.grafanaSettingController.createGrafanaSetting);
    this.router.delete('/grafana/resourceGroup/:resouceGroupId/settings', this.grafanaSettingController.deleteGrafanaSetting);
  }
}

export default GrafanaRoute;
