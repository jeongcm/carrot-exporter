import DB from '@/database';
import { CreateGrafanaSettingDto } from '../dtos/grafanaSetting.dto';
import { IGrafanaSetting } from '../models/grafanaSetting.model';
import ServiceExtension from '@/common/extentions/service.extension';

/**
 * @memberof Grafana
 */
class GrafanaSettingService extends ServiceExtension {
  public grafanaSetting = DB.GrafanaSetting;

  constructor() {
    super({
      tableName: 'GrafanaSetting',
    });
  }

  public async createGrafanaSetting(
    customerAccountKey: number,
    currentUserPartyKey: number,
    resourceGroupKey: number,
    grafanaSettingData: CreateGrafanaSettingDto,
  ): Promise<IGrafanaSetting> {
    try {
      const grafanaSettingId = await this.createTableId();

      const createGrafanaSetting: IGrafanaSetting = await this.grafanaSetting.create({
        grafanaSettingId,
        grafanaName: grafanaSettingData.grafanaName,
        grafanaType: grafanaSettingData.grafanaType,
        grafanaUrl: grafanaSettingData.grafanaUrl,
        configJson: grafanaSettingData.configJson,
        resourceGroupKey,
        customerAccountKey,
        createdBy: currentUserPartyKey,
        updatedBy: currentUserPartyKey,
      });
      return createGrafanaSetting;
    } catch (e) {
      this.throwError(`EXCEPTION`, e);
    }
  }

  public async getGrafanaSettingByResourceGroupId(
    customerAccountKey: number,
    resourceGroupKey: number,
    grafanaType: string,
  ): Promise<IGrafanaSetting> {
    try {
      const createGrafanaSetting: IGrafanaSetting = await this.grafanaSetting.findOne({
        where: {
          customerAccountKey,
          resourceGroupKey,
          grafanaType,
        },
      });
      return createGrafanaSetting;
    } catch (e) {
      this.throwError(`EXCEPTION`, e);
    }
  }

  public async updateGrafanaSettingByGroupId(
    customerAccountKey: number,
    currentUserPartyKey: number,
    resourceGroupKey: number,
    grafanaSettingData: CreateGrafanaSettingDto,
  ): Promise<boolean> {
    try {
      const affected: number[] = await this.grafanaSetting.update(
        {
          ...grafanaSettingData,
          updatedBy: currentUserPartyKey,
        },
        {
          where: {
            customerAccountKey,
            resourceGroupKey,
            grafanaType: grafanaSettingData.grafanaType,
          },
        },
      );
      return affected && affected[0] > 0;
    } catch (e) {
      this.throwError(`EXCEPTION`, e);
    }
  }

  public async deleteGrafanaSettingByGroupId(customerAccountKey: number, resourceGroupKey: number): Promise<boolean> {
    try {
      const affected: number = await this.grafanaSetting.destroy({
        where: {
          customerAccountKey,
          resourceGroupKey,
        },
      });
      return affected > 0;
    } catch (e) {
      this.throwError(`EXCEPTION`, e);
    }
  }
}

export default GrafanaSettingService;
