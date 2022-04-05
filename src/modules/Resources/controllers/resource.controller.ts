import { NextFunction, Request, Response } from 'express';
import { IResource } from '@/common/interfaces/resource.interface';
import ResourceService from '../services/resource.service';
import { ResourceDto } from '../dtos/resource.dto';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

class ResourceController {
  public apiService = new ResourceService();

  public createResource = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const apiData: ResourceDto = req.body;
      const currentUserId = req.user.partyId;
      const createResourceData: IResource = await this.apiService.createResource(apiData, currentUserId);

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
        resourceRBAC,
        resourceAnomalyMonitor,
        resourceActive,
        resourceStatus,
        resourceStatusUpdatedAt,
        customerAccountKey,
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
        resourceRBAC,
        resourceAnomalyMonitor,
        resourceActive,
        resourceStatus,
        resourceStatusUpdatedAt,
        customerAccountKey,
        parentResourceId,
        resourceNamespace,
      };

      res.status(201).json({ data: response, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllResource = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllResourceData: IResource[] = await this.apiService.getAllResource();

      res.status(200).json({ data: findAllResourceData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getResourceById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const apiId = req.params.apiId;

    try {
      const resource: IResource = await this.apiService.getResourceById(apiId);
      res.status(200).json({ data: resource, message: `find resource id(${apiId}) ` });
    } catch (error) {
      next(error);
    }
  };

  public updateResourceById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const apiId = req.params.apiId;
      const apiData = req.body;
      const currentUserId = req.user.partyId;

      const updateResourceData: IResource = await this.apiService.updateResourceById(apiId, apiData, currentUserId);

      res.status(200).json({ data: updateResourceData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default ResourceController;
