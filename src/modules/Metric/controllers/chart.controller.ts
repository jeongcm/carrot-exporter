import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import ChartService from '../services/chart.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';

class ChartController {
  public chartService = new ChartService();
  public resourceGroupService = new ResourceGroupService();

  public getAllCharts = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const data = await this.chartService.getAllCharts(customerAccountKey);
      res.status(200).json({ data: data, message: 'found all charts' });
    } catch (error) {
      next(error);
    }
  };

  public getResourceGroupChart = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const resourceGroupId = req.params.resourceGroupId;

      const resourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);

      if (!resourceGroup) {
        return res.status(404).json({ ok: false, reason: `No ResourceGroup found (ID: ${resourceGroupId})` });
      }

      const data = await this.chartService.getResourceGroupChart(customerAccountKey, resourceGroup.resourceGroupKey);
      res.status(200).json({ data: data, message: 'found chart for resourceGroup' });
    } catch (error) {
      next(error);
    }
  };

  public upsertResourceGroupChart = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const partyId = req.user.partyId;
      const resourceGroupId = req.params.resourceGroupId;

      if (!req.body) {
        return res.status(400).json({ ok: false, reason: `body missing (ID: ${resourceGroupId})` });
      }

      const resourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);

      if (!resourceGroup) {
        return res.status(404).json({ ok: false, reason: `No ResourceGroup found (ID: ${resourceGroupId})` });
      }

      const data = await this.chartService.upsertResourceGroupChart(customerAccountKey, resourceGroup.resourceGroupKey, partyId, req.body);
      res.status(200).json({ data: data, message: 'upsert resourceGroup Chart' });
    } catch (error) {
      next(error);
    }
  };
}

export default ChartController;
