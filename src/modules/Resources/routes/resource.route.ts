import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ResourceController from "@modules/Resources/controllers/resource.controller";

class ResourceRoute implements Routes {

  public router = Router();
  public resourceController = new ResourceController()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/resource', this.resourceController.uploadResource)
    this.router.post('/resource/event', this.resourceController.uploadResourceEvent)
  }
}

export default ResourceRoute;
