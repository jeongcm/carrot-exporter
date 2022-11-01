import { NextFunction, Response } from 'express';
import { IResource } from '@/common/interfaces/resource.interface';
import ResourceService from '../services/resource.service';
import ResourceGroupService from '../services/resourceGroup.service';
import TopologyService from '../services/topology.service';
import { ResourceDto } from '../dtos/resource.dto';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { GroupedCountResultItem } from 'sequelize';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';

class ResourceController {
  public resourceService = new ResourceService();
  public resourceGroupService = new ResourceGroupService();
  public topologyService = new TopologyService();

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
  public countResources = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { customerAccountKey } = req;
      const resourceTypes = req.query.resourceType as string[];

      const resourceCount: GroupedCountResultItem[] = await this.topologyService.countResources(customerAccountKey, resourceTypes);

      res.status(200).json({ data: resourceCount, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public countPodResources = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { customerAccountKey } = req;
      const resourceCount: any[] = await this.topologyService.countPodResources(customerAccountKey);

      res.status(200).json({ data: resourceCount, message: 'findAll' });
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
      const { customerAccountKey, query } = req;
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
    const customerAccountKey = req.customerAccountKey;

    try {
      const resource: IResource = await this.resourceService.getResourceById(resourceId);
      console.log('resource', resource);
      const resourceGroup: IResourceGroup = await this.resourceGroupService.getUserResourceGroupByKey(customerAccountKey, resource.resourceGroupKey);
      console.log('resourceGroup', resourceGroup);
      res.status(200).json({
        data: {
          resourceGroupId: resourceGroup.resourceGroupId,
          ...resource,
        },
        message: `find resource id(${resourceId}) `,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getAllStatusResourceById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceId = req.params.resourceId;
    const customerAccountKey = req.customerAccountKey;

    try {
      const resource: IResource = await this.resourceService.getAllStatusResourceById(resourceId);
      res.status(200).json({
        data: resource,

        message: `find resource id(${resourceId}) `,
      });
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
      ...req.query,
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
  public getWorkloadByResourceGroupUuid = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceGroupUuid: string = req.params.resourceGroupUuid;
    const allReplicasYN: string = req.params.allReplicasYN || 'N';

    try {
      const resource: IResource[] = await this.resourceService.getWorkloadByResourceGroupUuid(resourceGroupUuid, allReplicasYN);
      res.status(200).json({ data: resource, message: `find workloads with resourceGroupUuid(${resourceGroupUuid}` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getResourceByTypeResourceGroupIdForMetricOps = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceType: string[] = req.query.resourceType as string[];
    const resourceQuery: any = {
      ...req.query,
      excludeFailed: req.query.excludeFailed === 'true',
    };
    const resourceGroupId: string = req.params.resourceGroupId;

    try {
      const resource: IResource[] = await this.resourceService.getResourceByTypeResourceGroupIdForMetricOps(
        resourceType,
        resourceGroupId,
        resourceQuery,
      );
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
  public getResourceInNamespaceByTypeResourceGroupId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceType: string = req.params.resourceType;
    const resourceGroupId: string = req.params.resourceGroupId;

    try {
      const resource: IResource[] = await this.resourceService.getResourceInNamespaceByTypeResourceGroupId(resourceType, resourceGroupId);
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

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getResourceDetail = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resourceDetailData = req.body;
      const resourceData: IResource = await this.resourceService.getResourceDetail(resourceDetailData);
      res.status(200).json({ data: resourceData, message: 'get' });
    } catch (error) {
      next(error);
    }
  };

  public getAllTopology = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const topologyType = req.params.topologyType;
      const customerAccountKey = req.customerAccountKey;

      // TODO: Define ITopology
      const topology: any = await this.topologyService.getAllTopology(topologyType, customerAccountKey);

      res.status(200).json({ data: topology, message: 'get all topology' });
    } catch (error) {
      next(error);
    }
  };

  public getRelatedResources = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const resourceKey = await this.resourceService.getResourceKeyById(req.params.resourceId);

      // TODO: Define ITopology
      // Definitely need to add customerAccountKey for security reason
      const topology: any = await this.topologyService.getRelatedResources(resourceKey, customerAccountKey);

      res.status(200).json({ data: topology, message: 'get all topology' });
    } catch (error) {
      next(error);
    }
  };
}

export default ResourceController;
