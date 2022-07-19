import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

import { ResourceGroupDto } from '../dtos/resourceGroup.dto';
import ResourceGroupController from '../controllers/resourceGroup.controller';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class ResourceGroupRoute implements Routes {
  public router = Router();
  public resourceGroupController = new ResourceGroupController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/resourceGroup',
      authMiddleware,
      validationMiddleware(ResourceGroupDto, 'body'),
      createUserLogMiddleware,
      this.resourceGroupController.createResourceGroup,
    );
    this.router.get('/resourceGroup', authMiddleware, createUserLogMiddleware, this.resourceGroupController.getAllResourceGroups);
    this.router.get('/resourceGroup/:resourceGroupId', authMiddleware, createUserLogMiddleware, this.resourceGroupController.getResourceGroupById);

    this.router.get(
      '/resourceGroup/uuid/:resourceGroupUuid',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceGroupController.getResourceGroupByUuid,
    );
    this.router.get(
      '/resourceGroup/CustomerAccountId/:customerAccountId',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceGroupController.getResourceGroupByCustomerAccountId,
    );
    this.router.delete(
      '/resourceGroup/uuid/:resourceGroupUuid',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceGroupController.deleteResourceGroupByResourceGroupUuid,
    );
    this.router.put(
      '/resourceGroup/:resourceGroupId',
      authMiddleware,
      validationMiddleware(ResourceGroupDto, 'body'),
      createUserLogMiddleware,
      this.resourceGroupController.updateResourceGroupById,
    );
    this.router.get('/resourceGroup/:resourceGroupId/k8s', authMiddleware, createUserLogMiddleware, this.resourceGroupController.getK8sClusterDetail);
  }
}

export default ResourceGroupRoute;
