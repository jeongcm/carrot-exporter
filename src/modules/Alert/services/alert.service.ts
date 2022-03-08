import DB from '@/database';
import _ from 'lodash';
import { IAlert } from '@/common/interfaces/alert.interface';
import { CreateAlertDto } from '@/modules/Alert/dtos/alert.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { IncidentModel } from '@/modules/Incident/models/incident.model';
import SlackService from '@/modules/Messaging/services/slack.service';
import { SlackMessage } from '@/common/interfaces/slack.interface';

/**
 * @memberof Alert
 */
class AlertService {
  public alert = DB.Alerts;
  public slackService = new SlackService();

  /**
   * Get all alerts
   *
   * @param  {number} tenancyId
   * @returns Promise<IAlert[]>
   */
  public async getAllAlerts(tenancyId: number): Promise<IAlert[]> {
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

  /**
   * Get all the pinned alerts
   *
   * @param  {number} tenancyId
   * @returns Promise<IAlert[]>
   */
  public async getAllPinnedAlerts(tenancyId: number): Promise<IAlert[]> {
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

    let modifiedAlerts: IAlert[] = [];

    allPinnedAlerts.forEach(alertsX => {
      let incidents = alertsX['incidents'];

      let tempAlertsX = { ...JSON.parse(JSON.stringify(alertsX)) };

      tempAlertsX.incidentId = _.map(incidents, incidentsX => incidentsX.id);

      delete tempAlertsX.incidents;

      modifiedAlerts.push(tempAlertsX);
    });

    return modifiedAlerts;
  }

  /**
   * Get an alert by pk
   *
   * @param  {number} id
   * @returns Promise<IAlert>
   */
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

  /**
   * Create a new alert
   *
   * @param  {CreateAlertDto} alertData
   * @param  {number} tenancyId
   * @returns Promise<IAlert>
   */
  public async createAlert(alertData: CreateAlertDto, tenancyId: number): Promise<IAlert> {
    if (isEmpty(alertData)) throw new HttpException(400, 'Alert must not be empty');

    const createAlertData: IAlert = await this.alert.create({ ...alertData, tenancyId });

    return createAlertData;
  }

  /* RYAN: NEX-1417
  /**
   * Delete an alert
   *
   * @param  {number} id
   * @returns Promise<void>
   */
  public async deleteAlertById(id: number): Promise<void> {
    const alert: void = await this.alert.findByPk(id).then(alert => alert.destroy());
    return alert;
  }

  /**
   * Add a pin from an alert
   *
   * @param  {number} id
   * @returns Promise<void>
   */
  public async updateAlertPin(id: number): Promise<void> {
    await this.alert.update({ pinned: 1 }, { where: { id } });
  }

  /**
   * Remove a pin from an alert
   *
   * @param  {number} id
   * @returns Promise<void>
   */
  public async deleteAlertPin(id: number): Promise<void> {
    await this.alert.update({ pinned: 0 }, { where: { id } });
  }
}

export default AlertService;
