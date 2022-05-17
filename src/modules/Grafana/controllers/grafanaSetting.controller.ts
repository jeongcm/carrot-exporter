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

    const resourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);

    if (!resourceGroup) {
      res.status(500).json({ message: `resource group with id(${resourceGroupId}) does not found` });
    }

    try {
      const customerAccountKey = req.customerAccountKey;
      const currentUserPartyKey = req.user.partyKey;
      const createdGrafanaSetting: IGrafanaSetting = await this.grafanaSettingService.createGrafanaSetting(customerAccountKey, currentUserPartyKey, resourceGroup.resourceGroupKey, grafanaSettingData);

      res.status(201).json({ data: createdGrafanaSetting, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getGrafanaSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const GrafanaSettingId = req.params.GrafanaSettingId;

    try {
      const GrafanaSetting: IGrafanaSetting = await this.grafanaSettingService.getGrafanaSettingById(customerAccountKey, GrafanaSettingId);

      if (GrafanaSetting) {
        res.status(200).json({ data: GrafanaSetting, message: `find GrafanaSetting id(${GrafanaSettingId}) ` });
      } else {
        res.status(404).json({ message: `GrafanaSetting id(${GrafanaSettingId}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public updateGrafanaSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const GrafanaSettingId = req.params.GrafanaSettingId;
    const grafanaSettingData: UpdateGrafanaSettingDto = req.body;

    const GrafanaSetting = await this.grafanaSettingService.getGrafanaSettingById(customerAccountKey, GrafanaSettingId);

    if (!GrafanaSetting) {
      return res.sendStatus(404);
    }

    try {
      const grafanaSettingData: CreateGrafanaSettingDto = req.body;
      const logginedUserId = req.user.partyId;

      const updatedGrafanaSetting: IGrafanaSetting = await this.grafanaSettingService.updateGrafanaSetting(customerAccountKey, GrafanaSettingId, grafanaSettingData, logginedUserId);
      res.status(200).json({ data: updatedGrafanaSetting, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteGrafanaSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const GrafanaSettingId = req.params.GrafanaSettingId;

    const GrafanaSetting = await this.grafanaSettingService.getGrafanaSettingById(customerAccountKey, GrafanaSettingId);

    if (!GrafanaSetting) {
      return res.sendStatus(404);
    }

    try {
      const logginedUserId = req.user.partyId;

      await this.grafanaSettingService.deleteGrafanaSettingById(customerAccountKey, GrafanaSettingId, logginedUserId);
      res.status(204).json({ message: `delete GrafanaSetting id(${GrafanaSettingId})` });
    } catch (error) {
      next(error);
    }
  };
}

export default GrafanaSettingController;
