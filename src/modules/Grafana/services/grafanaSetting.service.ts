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
    grafanaSettingData: CreateGrafanaSettingDto
  ): Promise<IGrafanaSetting> {
    try {
      const grafanaSettingId = await this.createTableId();

      const createGrafanaSetting: IGrafanaSetting = await this.grafanaSetting.create({
        grafanaSettingId,
        grafanaUrl: grafanaSettingData.grafanaUrl,
        configJson: grafanaSettingData.configJson,
        resourceGroupKey,
        customerAccountKey,
        createdBy: currentUserPartyKey,
      });
      return createGrafanaSetting;
    } catch (e) {
      this.throwError(`EXCEPTION`, e);
    }
  }
}

export default GrafanaSettingService;
