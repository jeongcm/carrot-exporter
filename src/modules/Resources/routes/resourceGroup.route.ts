import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { ResourceGroupDto } from '../dtos/resourceGroup.dto';
import ResourceGroupController from '../controllers/resourceGroup.controller';

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
      this.resourceGroupController.createResourceGroup,
    );
    this.router.get('/resourceGroup', authMiddleware, this.resourceGroupController.getAllResourceGroup);
    this.router.get('/resourceGroup/:resourceGroupId', authMiddleware, this.resourceGroupController.getResourceGroupById);
    this.router.put(
      '/resourceGroup/:resourceGroupId',
      authMiddleware,
      validationMiddleware(ResourceGroupDto, 'body'),
      this.resourceGroupController.updateResourceGroupById,
    );
  }
}

export default ResourceGroupRoute;
