import DB from 'databases';
import _ from "lodash"
import { IAlert } from '@/interfaces/alert.interface';
import { CreateAlertDto } from '@dtos/alert.dto';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { IncidentModel } from '@/models/incident.model';
import SlackService from '@services/slack.service';
import { SlackMessage } from '@/interfaces/slack.interface';

class AlertService {
  public alert = DB.Alerts;
  public slackService = new SlackService();

  public async getAllAlerts(tenancyId: string): Promise<IAlert[]> {
    if (!tenancyId) throw new HttpException(400, `tenancyId is required in headers.`);

    const allAlerts: IAlert[] = await this.alert.findAll({
      where: { tenancyId },
      attributes: { exclude: ['tenancyId', 'alertRule', 'note', 'node', 'numberOfOccurrences'] },
      include: [
        {
          model: IncidentModel,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
   let modifiedAlerts: IAlert[] = [];

    allAlerts.forEach(alertsX => {

      let incidents = alertsX['incidents'];

      let tempAlertsX = { ...JSON.parse(JSON.stringify(alertsX)) };

      tempAlertsX.incidentId = _.map(incidents, incidentsX => incidentsX.id);

      delete tempAlertsX.incidents;

      modifiedAlerts.push(tempAlertsX);
    });

    return modifiedAlerts;
  }

  public async getAllPinnedAlerts(tenancyId: string): Promise<IAlert[]> {
    if (!tenancyId) throw new HttpException(400, `tenancyId is required in headers.`);

    const allPinnedAlerts: IAlert[] = await this.alert.findAll({
      where: { tenancyId, pinned: 1 },
      attributes: { exclude: ['tenancyId', 'alertRule', 'note', 'node', 'numberOfOccurrences'] },
      include: [
        {
          model: IncidentModel,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return allPinnedAlerts;
  }

  public async getAlertById(id: number): Promise<IAlert> {
    const alert: IAlert = await this.alert.findOne({
      where: { id },
      attributes: { exclude: ['tenancyId'] },
      include: [
        {
          model: IncidentModel,
        },
      ],
    });
    return alert;
  }

  public async createAlert(alertData: CreateAlertDto, tenancyId: string): Promise<IAlert> {
    if (isEmpty(alertData)) throw new HttpException(400, 'Alert must not be empty');

    const createAlertData: IAlert = await this.alert.create({ ...alertData, tenancyId });

    console.log(createAlertData);
    if(createAlertData){
      let slackData: SlackMessage = {
        name: createAlertData.alertName,
        description: createAlertData.description,
        clusterName: "some clustername",
        severity: createAlertData.severity,
      }
      let slackHook = "https://hooks.slack.com/services/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"
      await this.slackService.sendSlack(slackData, slackHook);
    }

    return createAlertData;
  }

  public async deleteAlertById(id: number): Promise<void> {
    const alert: void = await this.alert.findByPk(id).then(alert => alert.destroy());
    return alert;
  }

  public async updateAlertPin(id: number): Promise<void> {
    await this.alert.update({ pinned: 1 }, { where: { id } });
  }

  public async deleteAlertPin(id: number): Promise<void> {
    await this.alert.update({ pinned: 0 }, { where: { id } });
  }
}

export default AlertService;
