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
      '/resourceAllStatus/:resourceId',
      systemAuthMiddleware,
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getAllStatusResourceById,
    );
    this.router.get(
      '/resource/customerAccount/:customerAccountId',
      validationMiddleware(ResourceQueryDTO, 'query'),
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceByTypeCustomerAccountId,
    );

    this.router.get(
      '/resource/customerAccount/:customerAccountId/:resourceType',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourcesByCustomerAccountIdAndResourceType,
    );

    this.router.get(
      '/resource/:resourceId/detail',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceDetailByResourceID,
    );

    this.router.get(
      '/resource/resourceGroup/:resourceGroupId',
      validationMiddleware(ResourceQueryDTO, 'query'),
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceByTypeResourceGroupId,
    );

    this.router.get(
      '/resource/resourceGroup/metricOps/:resourceGroupId',
      validationMiddleware(ResourceQueryDTO, 'query'),
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceByTypeResourceGroupIdMetricOps,
    );

    this.router.get(
      '/resource/resourceGroup/:resourceGroupUuid/workloads', //all replicasets "Y" or "N"
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getWorkloadByResourceGroupUuid,
    );

    this.router.get(
      '/resource/resourceGroup/:resourceGroupId/metricOps',
      validationMiddleware(ResourceQueryDTO, 'query'),
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceByTypeResourceGroupIdForMetricOps,
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

    this.router.get(
      '/resource/:resourceType/count',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceCountByResourceType,
    );

    this.router.get(
      '/resource/ids',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceByResourceIds,
    );

    this.router.get(
      '/resource/count/k8sOverview',
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceCountForK8sOverview,
    );

    this.router.post('/resource/upload/:resourceType', systemAuthMiddleware, this.resourceController.uploadResource)

    this.router.get(
      '/resource/parentCustomerAccount/:parentCustomerAccountId',
      validationMiddleware(ResourceQueryDTO, 'query'),
      authMiddleware,
      createUserLogMiddleware,
      this.resourceController.getResourceByTypeParentCustomerAccountId,
    );
  }
}

export default ResourceRoute;
