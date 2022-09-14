import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import ResourceController from '../controllers/resource.controller';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class TopologyRoute implements Routes {
  public router = Router();
  public resourceController = new ResourceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/topology/resource/count', authMiddleware, createUserLogMiddleware, this.resourceController.countResources);
    this.router.get('/topology/resourceGroup/all/:topologyType', authMiddleware, createUserLogMiddleware, this.resourceController.getAllTopology);
    this.router.get(
      '/topology/resource/:resourceId/ns-related',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getRelatedResources,
    );
  }
}

export default TopologyRoute;
