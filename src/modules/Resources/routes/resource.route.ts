import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { ResourceDto, ResourceQueryDTO, ResourceDetailQueryDTO } from '../dtos/resource.dto';
import ResourceController from '../controllers/resource.controller';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

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
      createUserLogMiddleware,
      this.resourceController.createResource,
    );
    this.router.get('/resource', systemAuthMiddleware, authMiddleware, createUserLogMiddleware, this.resourceController.getAllResources);
    this.router.get('/resourceRbac', systemAuthMiddleware, authMiddleware, createUserLogMiddleware, this.resourceController.getAllResourcesRbac);
    this.router.get('/resource/:resourceId', systemAuthMiddleware, authMiddleware, createUserLogMiddleware, this.resourceController.getResourceById);
    this.router.get(
      '/resource/customerAccount/:customerAccountId',
      validationMiddleware(ResourceQueryDTO, 'query'),
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceByTypeCustomerAccountId,
    );
    this.router.get(
      '/resource/resourceGroup/:resourceGroupId',
      validationMiddleware(ResourceQueryDTO, 'query'),
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceByTypeResourceGroupId,
    );
    this.router.get(
      '/resource/resourceGroup/:resourceGroupId/resourceType/:resourceType',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceInNamespaceByTypeResourceGroupId,
    );

    this.router.put(
      '/resource/:resourceId',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(ResourceDto, 'body'),
      createUserLogMiddleware,
      this.resourceController.updateResourceById,
    );

    this.router.post(
      '/resource/resourceDetail',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(ResourceDetailQueryDTO, 'body'),
      createUserLogMiddleware,
      this.resourceController.getResourceDetail,
    );
  }
}

export default ResourceRoute;
