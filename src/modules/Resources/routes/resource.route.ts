import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { ResourceDto } from '../dtos/resource.dto';
import ResourceController from '../controllers/resource.controller';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

class ResourceRoute implements Routes {
  public router = Router();
  public resourceController = new ResourceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/resource',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(ResourceDto, 'body'),
      this.resourceController.createResource,
    );
    this.router.get('/resource', systemAuthMiddleware, authMiddleware, this.resourceController.getAllResource);
    this.router.get('/resource/:resourceId', systemAuthMiddleware, authMiddleware, this.resourceController.getResourceById);
    this.router.put(
      '/resource/:resourceId',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(ResourceDto, 'body'),
      this.resourceController.updateResourceById,
    );
  }
}

export default ResourceRoute;
