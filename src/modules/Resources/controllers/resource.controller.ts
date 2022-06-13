import { NextFunction, Response } from 'express';
import { IResource } from '@/common/interfaces/resource.interface';
import ResourceService from '../services/resource.service';
import { ResourceDto } from '../dtos/resource.dto';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

class ResourceController {
  public resourceService = new ResourceService();

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public createResource = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const resourceData: ResourceDto = req.body;
      const currentUserId = req.systemId;
      const createResourceData: IResource = await this.resourceService.createResource(resourceData, currentUserId, customerAccountKey);
      const {
        resourceId,
        resourceGroupKey,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        deletedAt,
        resourceName,
        resourceDescription,
        resourceInstance,
        resourceType,
        resourceLevel1,
        resourceLevel2,
        resourceLevel3,
        resourceLevel4,
        resourceLevelType,
        resourceRbac,
        resourceAnomalyMonitor,
        resourceActive,
        resourceStatus,
        resourceStatusUpdatedAt,
        parentResourceId,
        resourceNamespace,
      } = createResourceData;

      const response = {
        resourceId,
        resourceGroupKey,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        deletedAt,
        resourceName,
        resourceDescription,
        resourceInstance,
        resourceType,
        resourceLevel1,
        resourceLevel2,
        resourceLevel3,
        resourceLevel4,
        resourceLevelType,
        resourceRbac,
        resourceAnomalyMonitor,
        resourceActive,
        resourceStatus,
        resourceStatusUpdatedAt,
        parentResourceId,
        resourceNamespace,
      };

      res.status(201).json({ data: response, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getAllResources = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {customerAccountKey, query} = req
      const findAllResourceData: IResource[] = await this.resourceService.getAllResources(customerAccountKey, query);

      res.status(200).json({ data: findAllResourceData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getAllResourcesRbac = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findAllResourceRbacData: IResource[] = await this.resourceService.getAllResourcesRbac(customerAccountKey);

      res.status(200).json({ data: findAllResourceRbacData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getResourceById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceId = req.params.resourceId;

    try {
      const resource: IResource = await this.resourceService.getResourceById(resourceId);
      res.status(200).json({ data: resource, message: `find resource id(${resourceId}) ` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getResourceByTypeCustomerAccountId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceType: string[] = req.query.resourceType as string[];
    const customerAccountId: string = req.params.customerAccountId;

    try {
      const resource: IResource[] = await this.resourceService.getResourceByTypeCustomerAccountId(resourceType, customerAccountId);
      res.status(200).json({ data: resource, message: `find resources with customerAccountId(${customerAccountId}) and resoruceType ${resource}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getResourceByTypeResourceGroupId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceType: string[] = req.query.resourceType as string[];
    const resourceQuery: any = {
      excludeFailed: req.query.excludeFailed === 'true',
    };
    const resourceGroupId: string = req.params.resourceGroupId;

    try {
      const resource: IResource[] = await this.resourceService.getResourceByTypeResourceGroupId(resourceType, resourceGroupId, resourceQuery);
      res.status(200).json({ data: resource, message: `find resources with resourceGroup(${resourceGroupId}) and resoruceType ${resourceType}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public updateResourceById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params.resourceId;
      const resourceData = req.body;
      const currentUserId = req.systemId;

      const updateResourceData: IResource = await this.resourceService.updateResourceById(resourceId, resourceData, currentUserId);

      res.status(200).json({ data: updateResourceData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };


}

export default ResourceController;
