import { NextFunction, Response } from 'express';
import { IGrafanaSetting } from '../models/grafanaSetting.model';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateGrafanaSettingDto, UpdateGrafanaSettingDto } from '../dtos/grafanaSetting.dto';
import GrafanaSettingService from '../services/grafanaSetting.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';

class GrafanaSettingController {
  private grafanaSettingService = new GrafanaSettingService();
  private resourceGroupService = new ResourceGroupService();

  public createGrafanaSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceGroupId = req.params.resourceGroupId;
    const grafanaSettingData: CreateGrafanaSettingDto = req.body;

    try {
      const resourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);

      if (!resourceGroup) {
        res.status(500).json({ message: `resource group with id(${resourceGroupId}) does not found` });
      }

      const customerAccountKey = req.customerAccountKey;
      const currentUserPartyKey = req.user.partyKey;
      const createdGrafanaSetting: IGrafanaSetting = await this.grafanaSettingService.createGrafanaSetting(
        customerAccountKey,
        currentUserPartyKey,
        resourceGroup.resourceGroupKey,
        grafanaSettingData,
      );

      res.status(201).json({ data: createdGrafanaSetting, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getGrafanaSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const grafanaType = req.params.grafanaType;
    const resourceGroupId = req.params.resourceGroupId;

    try {
      const resourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);

      if (!resourceGroup) {
        res.status(500).json({ message: `resource group with id(${resourceGroupId}) does not found` });
      }

      const grafanaSetting: IGrafanaSetting = await this.grafanaSettingService.getGrafanaSettingByResourceGroupId(
        customerAccountKey,
        resourceGroup.resourceGroupKey,
        grafanaType,
      );

      if (grafanaSetting) {
        res.status(200).json({ data: grafanaSetting, message: `Found GrafanaSetting id(${grafanaSetting.grafanaSettingId}) ` });
      } else {
        res.status(404).json({ message: `GrafanaSetting not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public updateGrafanaSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceGroupId = req.params.resourceGroupId;
    const grafanaSettingData: CreateGrafanaSettingDto = req.body;

    try {
      const resourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);

      if (!resourceGroup) {
        res.status(500).json({ message: `resource group with id(${resourceGroupId}) does not found` });
      }

      const customerAccountKey = req.customerAccountKey;
      const currentUserPartyKey = req.user.partyKey;
      const updated: boolean = await this.grafanaSettingService.updateGrafanaSettingByGroupId(
        customerAccountKey,
        currentUserPartyKey,
        resourceGroup.resourceGroupKey,
        grafanaSettingData,
      );

      res.status(200).json({ updated });
    } catch (error) {
      next(error);
    }
  };

  public deleteGrafanaSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const resourceGroupId = req.params.resourceGroupId;
    const grafanaType = req.params.grafanaType;

    try {
      const resourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);

      if (!resourceGroup) {
        res.status(500).json({ message: `resource group with id(${resourceGroupId}) does not found` });
      }

      const customerAccountKey = req.customerAccountKey;
      const deleted: boolean = await this.grafanaSettingService.deleteGrafanaSettingByGroupId(customerAccountKey, resourceGroup.resourceGroupKey);

      res.status(200).json({ deleted });
    } catch (error) {
      next(error);
    }
  };
}

export default GrafanaSettingController;
