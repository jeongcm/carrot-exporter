import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ResourceManagerController from '@/modules/Resources/controllers/ncp/resourceManager.controller';

class ResourceRoute implements Routes {
  public router = Router();
  public resourceManagerController = new ResourceManagerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/resourceManager/resource', this.resourceManagerController.uploadNcpResource);
  }
}

export default ResourceRoute;
