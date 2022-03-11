import _ from 'lodash';
import DB from '@/database';
import { IIncident } from '@/common/interfaces/incident.interface';
import { CreateIncidentDto, UpdateIncidentStatusDto, UpdateIncidentDto, CreateRelatedAlertDto } from '@/modules/Incident/dtos/incident.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { IncidentModel } from '@/modules/Incident/models/incident.model';
import { IIncidentAction } from '@/common/interfaces/incidentAction.interface';
import { UserModel } from '@/modules/UserTenancy/models/users.model';
import { IncidentActionModel } from '@/modules/Incident/models/incidentAction.model';
import { AlertModel } from '@/modules/Alert/models/alert.model';
import { IIncidentRelAlert } from '@/common/interfaces/incidentRelAlert.interface';
import { IIncidentCounts } from '@/common/interfaces/incidentCounts.interface';
import sequelize from 'sequelize';
import { Op } from 'sequelize';

/**
 * @memberof Incident
 */
class IncidentService {
  public incident = DB.Incident;
  public alert = DB.Alerts;
  public incidentRelAlert = DB.IncidentRelAlert;
  public incidentAction = DB.IncidentAction;

  /**
   * Get all incidents in the tenancy
   *
   * @param  {number} currentTenancyPk
   * @returns Promise<IIncident[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getAllIncidents(currentTenancyPk: number): Promise<IIncident[]> {
    const allIncidents: IIncident[] = await this.incident.findAll({
      where: { isDeleted: 0, tenancyPk: currentTenancyPk },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['pk', 'isDeleted', 'assigneePk'] },
      include: [
        {
          as: 'assignee',
          model: UserModel,
          attributes: ['email', 'lastAccess', 'username', 'photo', 'id'],
        },
      ],
    });
    return allIncidents;
  }

  /**
   * Get an incident by id
   *
   * @param  {number} id
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentById(id: string): Promise<IIncident> {
    const incident: IIncident = await this.incident.findOne({
      where: { id },
      attributes: { exclude: ['pk', 'isDeleted', 'assigneePk'] },
      include: {
        as: 'assignee',
        model: UserModel,
        attributes: ['email', 'lastAccess', 'username', 'photo'],
      },
    });

    return incident;
  }

  // RYAN: @saemsol
  /**
   * Get all the alerts related to an invident
   *
   * @param  {number} id
   * @param  {number} currentTenancyPk
   * @returns Promise<IIncidentRelAlert[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getAlertsByIncidentId(incidentId: string, currentTenancyPk: number): Promise<IIncidentRelAlert[]> {
    const incident: IIncident = await this.incident.findOne({ where: { id: incidentId } });

    const alerts: IIncidentRelAlert[] = await this.incidentRelAlert.findAll({
      where: { incidentPk: incident.pk },
      include: [
        {
          model: AlertModel,
          attributes: {
            exclude: ['pk', 'tenancyPk', 'alertRule', 'note', 'node', 'numberOfOccurrences'],
            // include: [[sequelize.col('incidents.id'), 'incidentId']],
          },
          include: [
            {
              model: IncidentModel,
              where: { isDeleted: 0, tenancyPk: currentTenancyPk },
              attributes: [],
            },
          ],
        },
      ],
      attributes: {
        include: [[sequelize.col('alert.id'), 'alertId']],
      },
    });

    /*
    const modifiedAlerts: IIncidentRelAlert[] = [];

    alerts.forEach(alertsX => {
      const incidents = alertsX['alert']['incidents'];

      const tempAlertsX = { ...JSON.parse(JSON.stringify(alertsX)) };

      tempAlertsX.alert.incidentPk = _.map(incidents, incidentsX => incidentsX.id);

      delete tempAlertsX.alert.incidents;

      modifiedAlerts.push(tempAlertsX.alert);
    });
    */

    return alerts;
  }

  /**
   * Relate alerts to an incident
   *
   * @param  {string} incidentId
   * @param  {CreateRelatedAlertDto} relatedAlertData
   * @returns Promise<IIncidentRelAlert[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async createRelatedAlertsByIncident(incidentId: string, relatedAlertData: CreateRelatedAlertDto): Promise<IIncidentRelAlert[]> {
    if (isEmpty(relatedAlertData)) throw new HttpException(400, 'Alert must not be empty');

    const incident = await this.incident.findOne({ where: { id: incidentId } });

    if (!incident) {
      return [];
    }

    const incidentPk = incident.pk;

    const { relatedAlertIds } = relatedAlertData;

    const relatedAlertDetails = await this.alert.findAll({
      where: { id: { [Op.in]: relatedAlertIds } },
      attributes: ['pk'],
    });

    const relatedAlertalertPks = relatedAlertDetails.map(item => item.pk);

    const relatedAlerts = relatedAlertalertPks.map(alertPk => {
      return {
        incidentPk,
        alertPk,
      };
    });

    return await this.incidentRelAlert.bulkCreate(relatedAlerts, { returning: true });
  }

  // RYAN: @saemsol NEX-1417
  /**
   * Dissociate alerts from an incident
   *
   * @param  {string} incidentId
   * @param  {CreateRelatedAlertDto} relatedAlertData
   * @returns Promise<void>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async deleteRelatedAlertsByIncident(incidentId: string, relatedAlertData: CreateRelatedAlertDto): Promise<void> {
    if (isEmpty(relatedAlertData)) throw new HttpException(400, 'Incident must not be empty');

    const incident = await this.incident.findOne({ where: { id: incidentId } });

    if (!incident) {
      return;
    }

    const incidentPk = incident.pk;

    const { relatedAlertIds } = relatedAlertData;

    //here

    const relatedAlertDetails = await this.alert.findAll({
      where: { id: { [Op.in]: relatedAlertIds } },
      attributes: ['pk'],
    });

    const relatedAlertalertPks = relatedAlertDetails.map(item => item.pk);

    await this.incidentRelAlert.destroy({
      where: {
        incidentPk,
        alertPk: { [Op.in]: relatedAlertalertPks },
      },
    });
  }

  /**
   * Get all the actions in an incident
   *
   * @param  {string} id
   * @returns Promise<IIncidentAction[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentActionsById(id: string): Promise<IIncidentAction[]> {
    const incident = await this.incident.findOne({ where: { id } });

    if (!incident) {
      return;
    }

    const incidentPk = incident.pk;

    const incidentActions: IIncidentAction[] = await this.incidentAction.findAll({
      where: { incidentPk, isDeleted: 0 },
      attributes: { exclude: ['pk', 'incidentPk', 'isDeleted'] },
    });

    return incidentActions;
  }

  /**
   * Get numbers of incidents status.
   *
   * For eg:
   * closedCount: 3
   * inprogressCount: 5
   * openCount: 2
   * resolvedCount: 3
   *
   * @param  {number} currentTenancyPk
   * @returns Promise<IIncidentCounts>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentCounts(currentTenancyPk: number): Promise<IIncidentCounts> {
    const closedAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'CLOSED', tenancyPk: currentTenancyPk },
    });
    const inprogressAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'IN_PROGRESS', tenancyPk: currentTenancyPk },
    });
    const openAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'OPEN', tenancyPk: currentTenancyPk },
    });
    const resolvedAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'RESOLVED', tenancyPk: currentTenancyPk },
    });

    const incidentCounts: IIncidentCounts = {
      closedCount: closedAmount,
      inprogressCount: inprogressAmount,
      openCount: openAmount,
      resolvedCount: resolvedAmount,
    };

    return incidentCounts;
  }

  /**
   * Create a new incident
   *
   * @param  {CreateIncidentDto} incidentData
   * @param  {number} currentUserPk
   * @param  {number} currentTenancyPk
   * @param  {number} assigneePk
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async createIncident(
    incidentData: CreateIncidentDto,
    currentUserPk: number,
    currentTenancyPk: number,
    assigneePk: number,
  ): Promise<IIncident> {
    if (isEmpty(incidentData)) throw new HttpException(400, 'Incident must not be empty');

    const { title, note, status, priority, dueDate, relatedAlertIds, actions } = incidentData;

    const createIncidentData: any = await this.incident.create({
      assigneePk,
      title,
      note,
      status,
      priority,
      dueDate,
      tenancyPk: currentTenancyPk,
      createdBy: currentUserPk,
    });

    if (relatedAlertIds) {
      const relatedAlertDetails = await this.alert.findAll({
        where: { id: { [Op.in]: relatedAlertIds } },
        attributes: ['pk'],
      });

      const relatedAlertalertPks = relatedAlertDetails.map(item => item.pk);

      const relatedAlerts = relatedAlertalertPks.map(alertPk => {
        return {
          incidentPk: createIncidentData.dataValues.pk,
          alertPk,
        };
      });

      await this.incidentRelAlert.bulkCreate(relatedAlerts, { returning: true });
    }

    if (actions) {
      const incidentActions = actions.map(action => {
        return {
          incidentPk: createIncidentData.dataValues.pk,
          title: action.title,
          description: action.description,
          createdBy: currentUserPk,
        };
      });
      await this.incidentAction.bulkCreate(incidentActions);
    }

    return createIncidentData;
  }

  /**
   * Delete an incident
   *
   * @param  {string} id
   * @param  {number} currentUserPk
   * @returns Promise<[number, IncidentModel[]]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async deleteIncidentById(id: string, currentUserPk: number): Promise<[number, IncidentModel[]]> {
    const deletedIncident: [number, IncidentModel[]] = await this.incident.update({ isDeleted: 1, updatedBy: currentUserPk }, { where: { id } });
    await this.incidentRelAlert.destroy({ where: { incidentPk: id } });
    await this.incidentAction.destroy({ where: { incidentPk: id } });

    return deletedIncident;
  }

  /**
   * Update an incident
   *
   * @param  {string} id
   * @param  {UpdateIncidentDto} incidentData
   * @param  {number} currentUserPk
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncident(id: string, incidentData: UpdateIncidentDto, currentUserPk: number): Promise<IIncident> {
    const { relatedAlertIds, actions } = incidentData;

    const incident = await this.incident.findOne({ where: { id } });

    if (!incident) {
      return null;
    }

    const incidentPk = incident.pk;

    await this.incident.update({ ...incidentData, updatedBy: currentUserPk }, { where: { id } });

    if (relatedAlertIds) {
      await this.incidentRelAlert.destroy({ where: { incidentPk } });

      const relatedAlertDetails = await this.alert.findAll({
        where: { id: { [Op.in]: relatedAlertIds } },
        attributes: ['pk'],
      });

      const relatedAlertalertPks = relatedAlertDetails.map(item => item.pk);

      const relatedAlerts = relatedAlertalertPks.map(alertPk => {
        return {
          incidentPk,
          alertPk,
        };
      });

      await this.incidentRelAlert.bulkCreate(relatedAlerts, { returning: true });
    }

    if (actions) {
      await this.incidentAction.destroy({ where: { incidentPk } });
      const incidentActions = actions.map(action => {
        return {
          incidentPk,
          title: action.title,
          description: action.description,
          createdBy: currentUserPk,
        };
      });
      await this.incidentAction.bulkCreate(incidentActions);
    }

    return this.getIncidentById(id);
  }

  /**
   * Update the "status" field of an incident specifically
   *
   * @param  {string} id
   * @param  {UpdateIncidentStatusDto} incidentStatusData
   * @param  {number} currentUserId
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncidentStatus(id: string, incidentStatusData: UpdateIncidentStatusDto, currentUserPk: number): Promise<IIncident> {
    await this.incident.update({ status: incidentStatusData.status, updatedBy: currentUserPk }, { where: { id } });

    return this.getIncidentById(id);
  }

  /**
   * Create an action for an incident
   *
   * @param  {any} actionData
   * @param  {number} currentUserPk
   * @param  {string} incidentId
   * @returns Promise<IIncidentAction>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async createIncidentAction(actionData: any, currentUserPk: number, incidentId: string): Promise<IIncidentAction> {
    if (isEmpty(actionData)) throw new HttpException(400, 'Incident must not be empty');

    const incident = await this.incident.findOne({ where: { id: incidentId } });

    if (!incident) {
      return null;
    }

    const incidentPk = incident.pk;

    const createActionData: IIncidentAction = await this.incidentAction.create({
      createdBy: currentUserPk,
      incidentPk,
      ...actionData,
    });

    return createActionData;
  }

  /**
   * Update an anction within incident
   *
   * @param  {any} actionData
   * @param  {number} currentUserPk
   * @param  {number} incidentPk
   * @param  {number} actionId
   * @returns Promise<IIncidentAction>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncidentAction(actionData: any, currentUserPk: number, incidentId: string, actionId: string): Promise<IIncidentAction> {
    if (isEmpty(actionData)) throw new HttpException(400, 'Incident must not be empty');

    const incident = await this.incident.findOne({ where: { id: incidentId } });

    if (!incident) {
      return null;
    }

    const incidentPk = incident.pk;

    await this.incidentAction.update(
      {
        updatedBy: currentUserPk,
        ...actionData,
      },
      { where: { id: actionId, incidentPk } },
    );

    const updateResult: IIncidentAction = await this.incidentAction.findOne({ where: { id: actionId } });
    return updateResult;
  }

  /**
   * Delete an action from incident
   *
   * @param  {string} incidentId
   * @param  {number} currentUserPk
   * @param  {number} actionId
   * @returns Promise
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async deleteIncidentActionById(incidentId: string, currentUserPk: number, actionId: string): Promise<[number, IncidentActionModel[]]> {
    const incident: IIncident = await this.incident.findOne({
      where: { id: incidentId },
    });

    const deletedIncidentAction: [number, IncidentActionModel[]] = await this.incidentAction.update(
      { isDeleted: 1, updatedBy: currentUserPk },
      { where: { id: actionId, incidentPk: incident.pk } },
    );

    return deletedIncidentAction;
  }
}

export default IncidentService;
