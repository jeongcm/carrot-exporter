import { NextFunction, Response } from 'express';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import ResourceGroupService from '../services/resourceGroup.service';
import { ResourceGroupDto } from '../dtos/resourceGroup.dto';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

class ResourceGroupController {
  public resourceGroupService = new ResourceGroupService();

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public createResourceGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const resourceGroupData: ResourceGroupDto = req.body;
      const currentUserId = req.user.partyId;
      const createResourceGroupData: IResourceGroup = await this.resourceGroupService.createResourceGroup(
        resourceGroupData,
        currentUserId,
        customerAccountKey,
      );
      const {
        resourceGroupId,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        deletedAt,
        resourceGroupName,
        resourceGroupDescription,
        resourceGroupProvider,
        resourceGroupPlatform,
        resourceGroupUuid,
        resourceGroupPrometheus,
      } = createResourceGroupData;

      const response = {
        resourceGroupId,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        deletedAt,
        resourceGroupName,
        resourceGroupDescription,
        resourceGroupProvider,
        resourceGroupPlatform,
        resourceGroupUuid,
        resourceGroupPrometheus,
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
  public getAllResourceGroups = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findAllResourceGroupData: IResourceGroup[] = await this.resourceGroupService.getAllResourceGroups(customerAccountKey);

      res.status(200).json({ data: findAllResourceGroupData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getResourceGroupById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceGroupId = req.params.resourceGroupId;

    try {
      const resourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);
      res.status(200).json({ data: resourceGroup, message: `find resourceGroup id(${resourceGroupId}) ` });
    } catch (error) {
      next(error);
    }
  };


  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
   public getResourceGroupByUuid = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceGroupUuid = req.params.resourceGroupUuid;

    try {
      const resourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid);
      res.status(200).json({ data: resourceGroup, message: `find resourceGroup id(${resourceGroupUuid}) ` });
    } catch (error) {
      next(error);
    }
  };



  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public updateResourceGroupById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resourceGroupId = req.params.resourceGroupId;
      const resourceGroupData = req.body;
      const currentUserId = req.user.partyId;

      const updateResourceGroupData: IResourceGroup = await this.resourceGroupService.updateResourceGroupById(
        resourceGroupId,
        resourceGroupData,
        currentUserId,
      );

      res.status(200).json({ data: updateResourceGroupData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default ResourceGroupController;
