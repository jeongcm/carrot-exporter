import DB from '@/database';
import _ from 'lodash';
import { IAlert } from '@/common/interfaces/alert.interface';
import { AlertListDto, CreateAlertDto } from '@/modules/Alert/dtos/alert.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { IncidentModel } from '@/modules/Incident/models/incident.model';
import SlackService from '@/modules/Messaging/services/slack.service';

/**
 * @memberof Alert
 */
class AlertService {
  public alert = DB.Alerts;
  public slackService = new SlackService();

  /**
   * Get all alerts
   *
   * @param  {number} tenancyPk
   * @returns Promise<IAlert[]>
   */
  public async getAllAlerts(tenancyPk: number): Promise<AlertListDto[]> {
    if (!tenancyPk) throw new HttpException(400, `tenancyPk is required in headers.`);

    const allAlerts: IAlert[] = await this.alert.findAll({
      where: { tenancyPk },
      attributes: { exclude: ['tenancyPk', 'alertRule', 'note', 'node', 'numberOfOccurrences'] },
      include: [
        {
          model: IncidentModel,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const modifiedAlerts: AlertListDto[] = [];

    allAlerts.forEach(alertsX => {
      const incidents = alertsX['incidents'];

      const tempAlertsX = { ...JSON.parse(JSON.stringify(alertsX)) };

      tempAlertsX.incidentId = _.map(incidents, incidentsX => incidentsX.id);

      delete tempAlertsX.incidents;

      modifiedAlerts.push(tempAlertsX);
    });

    return modifiedAlerts;
  }

  /**
   * Get all the pinned alerts
   *
   * @param  {number} tenancyPk
   * @returns Promise<IAlert[]>
   */
  public async getAllPinnedAlerts(tenancyPk: number): Promise<AlertListDto[]> {
    if (!tenancyPk) throw new HttpException(400, `tenancyPk is required in headers.`);

    const allPinnedAlerts: IAlert[] = await this.alert.findAll({
      where: { tenancyPk, pinned: 1 },
      attributes: { exclude: ['tenancyPk', 'alertRule', 'note', 'node', 'numberOfOccurrences'] },
      include: [
        {
          model: IncidentModel,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const modifiedAlerts: AlertListDto[] = [];

    allPinnedAlerts.forEach(alertsX => {
      const incidents = alertsX['incidents'];

      const tempAlertsX = { ...JSON.parse(JSON.stringify(alertsX)) };

      tempAlertsX.incidentId = _.map(incidents, incidentsX => incidentsX.id);

      delete tempAlertsX.incidents;

      modifiedAlerts.push(tempAlertsX);
    });

    return modifiedAlerts;
  }

  /**
   * Get an alert by id
   *
   * @param  {string} id
   * @returns Promise<IAlert>
   */
  public async getAlertById(id: string): Promise<IAlert> {
    const alert: IAlert = await this.alert.findOne({
      where: { id },
      attributes: { exclude: ['tenancyPk', 'pk'] },
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
   * @param  {number} tenancyPk
   * @returns Promise<IAlert>
   */
  public async createAlert(alertData: CreateAlertDto, tenancyPk: number): Promise<IAlert> {
    if (isEmpty(alertData)) throw new HttpException(400, 'Alert must not be empty');

    const createAlertData: IAlert = await this.alert.create({ ...alertData, tenancyPk });

    return createAlertData;
  }

  /* RYAN: NEX-1417
  /**
   * Delete an alert
   *
   * @param  {string} id
   * @returns Promise<void>
   */
  public async deleteAlertById(id: string): Promise<void> {
    const alert: void = await this.alert.findOne({ where: { id } }).then(alert => alert.destroy());
    return alert;
  }

  /**
   * Add a pin from an alert
   *
   * @param  {string} id
   * @returns Promise<void>
   */
  public async updateAlertPin(id: string): Promise<void> {
    await this.alert.update({ pinned: 1 }, { where: { id } });
  }

  /**
   * Remove a pin from an alert
   *
   * @param  {string} id
   * @returns Promise<void>
   */
  public async deleteAlertPin(id: string): Promise<void> {
    await this.alert.update({ pinned: 0 }, { where: { id } });
  }
}

export default AlertService;
