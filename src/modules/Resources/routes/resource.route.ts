import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ResourceController from '@modules/Resources/controllers/resource.controller';
import NcpResourceController from '@modules/Resources/controllers/ncpResource.controller';

class ResourceRoute implements Routes {
  public router = Router();
  public resourceController = new ResourceController();
  public ncpResourceController = new NcpResourceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/resource', this.resourceController.uploadResource);
    this.router.post('/resource/ncp', this.ncpResourceController.uploadNcpResource);
  }
}

export default ResourceRoute;
