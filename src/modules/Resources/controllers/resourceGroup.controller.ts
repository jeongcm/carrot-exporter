import { NextFunction, Response } from 'express';
import { IResourceGroup, IResourceGroupUi } from '@/common/interfaces/resourceGroup.interface';
import ResourceGroupService from '../services/resourceGroup.service';
import { ResourceGroupDto } from '../dtos/resourceGroup.dto';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import k8sService from '../services/k8s.service';

class ResourceGroupController {
  public resourceGroupService = new ResourceGroupService();
  public k8sService = new k8sService();

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
        resourceGroupSudoryNamespace,
        resourceGroupKpsLokiNamespace,
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
        resourceGroupSudoryNamespace,
        resourceGroupKpsLokiNamespace,
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
      const findAllResourceGroupData: IResourceGroupUi[] = await this.resourceGroupService.getAllResourceGroups(customerAccountKey);

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
      const resourceGroup: IResourceGroupUi = await this.resourceGroupService.getResourceGroupById(resourceGroupId);
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
      const resourceGroup: IResourceGroupUi = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid);
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
  public getObservabilityResourcesByResourceGroupUuid = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceGroupUuid = req.params.resourceGroupUuid;

    try {
      const resourceGroup = await this.resourceGroupService.getObservabilityResourcesByResourceGroupUuid(resourceGroupUuid);
      res.status(200).json({ data: resourceGroup, message: `find observability resources of resourceGroup uuid(${resourceGroupUuid}) ` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getResourceGroupByCustomerAccountId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountId = req.params.customerAccountId;
    let resourceGroup: IResourceGroupUi[]

    try {
      resourceGroup = await this.resourceGroupService.getResourceGroupByCustomerAccountId(customerAccountId, req.query);
      res.status(200).json({ data: resourceGroup, message: `find resourceGroup for customerAccountId(${customerAccountId}) ` });
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

      const updateResourceGroupData: IResourceGroupUi = await this.resourceGroupService.updateResourceGroupById(
        resourceGroupId,
        resourceGroupData,
        currentUserId,
      );

      res.status(200).json({ data: updateResourceGroupData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getK8sClusterDetail = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resourceGroupId = req.params.resourceGroupId;
      const customerAccountKey = req.customerAccountKey;

      // TODO: to create getResourceGroupKeyById
      const resourceGroup: IResourceGroupUi = await this.resourceGroupService.getResourceGroupById(resourceGroupId);

      // TODO: create an interface
      const k8sDetail: any = await this.k8sService.getClusterDetail(resourceGroup.resourceGroupKey, customerAccountKey);

      res.status(200).json({ data: k8sDetail, message: 'getK8sDetail' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public deleteResourceGroupByResourceGroupUuid = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resourceGroupUuid = req.params.resourceGroupUuid;
      const deleteOption = req.params.deleteOption; // "1" - regular delete || "2" - delete including kps/Loki
      const customerAccountKey = req.customerAccountKey;

      const resultDeleteResourceGroup = await this.resourceGroupService.deleteResourceGroupByResourceGroupUuid(
        resourceGroupUuid,
        customerAccountKey,
        deleteOption,
      );
      res.status(200).json({ data: resultDeleteResourceGroup, message: `resourceGroup Deleted - ${resourceGroupUuid}` });
    } catch (error) {
      next(error);
    }
  };
}

export default ResourceGroupController;
