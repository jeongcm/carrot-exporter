import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ResourceController from '@modules/Resources/controllers/resource.controller';
import ResourceManagerController from '@modules/Resources/controllers/ncp/resourceManager.controller';

class ResourceRoute implements Routes {
  public router = Router();
  public resourceController = new ResourceController();
  public resourceManagerController = new ResourceManagerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/resource', this.resourceController.uploadResource);
    this.router.post('/resource/ncp', this.resourceManagerController.uploadNcpResource);
  }
}

export default ResourceRoute;
