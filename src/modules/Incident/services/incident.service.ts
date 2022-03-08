import _ from 'lodash';
import DB from '@/database';
import { IIncident } from '@/common/interfaces/incident.interface';
import { IAlert } from '@/common/interfaces/alert.interface';
import { CreateIncidentDto, UpdateIncidentStatusDto, UpdateIncidentDto, CreateRelatedAlertDto } from '@/modules/Incident/dtos/incident.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { IncidentModel } from '@/modules/Incident/models/incident.model';
import { IIncidentAction } from '@/common/interfaces/incidentAction.interface';
import { UserModel } from '@/modules/UserTenancy/models/users.model';
import { CreateActionDto } from '@/modules/Incident/dtos/incidentAction.dto';
import { IncidentActionModel } from '@/modules/Incident/models/incidentAction.model';
import { AlertModel } from '@/modules/Alert/models/alert.model';
import { IIncidentRelAlert } from '@/common/interfaces/incidentRelAlert.interface';
import { IIncidentCounts } from '@/common/interfaces/incidentCounts.interface';

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
   * @param  {number} currentTenancyId
   * @returns Promise<IIncident[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getAllIncidents(currentTenancyId: number): Promise<IIncident[]> {
    const allIncidents: IIncident[] = await this.incident.findAll({
      where: { isDeleted: 0, tenancyId: currentTenancyId },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['isDeleted', 'assigneeId'] },
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
   * Get an incident by pk
   *
   * @param  {number} id
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentById(id: number): Promise<IIncident> {
    const incident: IIncident = await this.incident.findOne({
      where: { id },
      attributes: { exclude: ['isDeleted'] },
      include: {
        as: 'assignee',
        model: UserModel,
        attributes: ['email', 'lastAccess', 'username', 'photo'],
      },
    });

    return incident;
  }

  /**
   * Get all the alerts related to an invident
   *
   * @param  {number} id
   * @param  {number} currentTenancyId
   * @returns Promise<IIncidentRelAlert[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getAlertsByIncidentId(id: number, currentTenancyId: number): Promise<IIncidentRelAlert[]> {
    const alerts: IIncidentRelAlert[] = await this.incidentRelAlert.findAll({
      where: { incidentId: id },
      include: [
        {
          model: AlertModel,
          attributes: { exclude: ['tenancyId', 'alertRule', 'note', 'node', 'numberOfOccurrences'] },
          include: [
            {
              model: IncidentModel,
              where: { isDeleted: 0, tenancyId: currentTenancyId },
            },
          ],
        },
      ],
    });

    let modifiedAlerts: IIncidentRelAlert[] = [];

    alerts.forEach(alertsX => {
      let incidents = alertsX['alert']['incidents'];

      let tempAlertsX = { ...JSON.parse(JSON.stringify(alertsX)) };

      tempAlertsX.alert.incidentId = _.map(incidents, incidentsX => incidentsX.id);

      delete tempAlertsX.alert.incidents;

      modifiedAlerts.push(tempAlertsX.alert);
    });

    return modifiedAlerts;
  }

  /**
   * Relate alerts to an incident
   *
   * @param  {number} incidentId
   * @param  {CreateRelatedAlertDto} relatedAlertData
   * @returns Promise<IIncidentRelAlert[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async createRelatedAlertsByIncident(incidentId: number, relatedAlertData: CreateRelatedAlertDto): Promise<IIncidentRelAlert[]> {
    if (isEmpty(relatedAlertData)) throw new HttpException(400, 'Incident must not be empty');

    const { relatedAlertIds } = relatedAlertData;

    let relatedAlerts = relatedAlertIds.map(alertId => {
      return {
        incidentId,
        alertId,
      };
    });

    const result = await this.incidentRelAlert.bulkCreate(relatedAlerts, { returning: true });

    return result;
  }

  // RYAN: @saemsol NEX-1417
  /**
   * Dissociate alerts from an incident
   *
   * @param  {number} incidentId
   * @param  {CreateRelatedAlertDto} relatedAlertData
   * @returns Promise<void>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async deleteRelatedAlertsByIncident(incidentId: number, relatedAlertData: CreateRelatedAlertDto): Promise<void> {
    if (isEmpty(relatedAlertData)) throw new HttpException(400, 'Incident must not be empty');

    const { relatedAlertIds } = relatedAlertData;

    await this.incidentRelAlert.destroy({
      where: {
        incidentId,
        alertId: relatedAlertIds,
      },
    });
  }

  /**
   * Get all the actions in an incident
   *
   * @param  {number} id
   * @returns Promise<IIncidentAction[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentActionsById(id: number): Promise<IIncidentAction[]> {
    const incidentActions: IIncidentAction[] = await this.incidentAction.findAll({
      where: { incidentId: id, isDeleted: 0 },
      attributes: { exclude: ['isDeleted'] },
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
   * @param  {number} currentTenancyId
   * @returns Promise<IIncidentCounts>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentCounts(currentTenancyId: number): Promise<IIncidentCounts> {
    const closedAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'CLOSED', tenancyId: currentTenancyId },
    });
    const inprogressAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'IN_PROGRESS', tenancyId: currentTenancyId },
    });
    const openAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'OPEN', tenancyId: currentTenancyId },
    });
    const resolvedAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'RESOLVED', tenancyId: currentTenancyId },
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
   * @param  {number} currentUserId
   * @param  {number} currentTenancyId
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async createIncident(incidentData: CreateIncidentDto, currentUserId: number, currentTenancyId: number): Promise<IIncident> {
    if (isEmpty(incidentData)) throw new HttpException(400, 'Incident must not be empty');

    const { assigneeId, title, note, status, priority, dueDate, relatedAlertIds, actions } = incidentData;

    const createIncidentData: any = await this.incident.create({
      assigneeId,
      title,
      note,
      status,
      priority,
      dueDate,
      tenancyId: currentTenancyId,
      createdBy: currentUserId,
    });

    if (relatedAlertIds) {
      let relatedAlerts = relatedAlertIds.map(alertId => {
        return {
          incidentId: createIncidentData.dataValues.id,
          alertId,
        };
      });

      await this.incidentRelAlert.bulkCreate(relatedAlerts, { returning: true });
    }

    if (actions) {
      let incidentActions = actions.map(action => {
        return {
          incidentId: createIncidentData.dataValues.id,
          title: action.title,
          description: action.description,
          createdBy: currentUserId,
        };
      });
      await this.incidentAction.bulkCreate(incidentActions);
    }

    return createIncidentData;
  }

  /**
   * Delete an incident
   *
   * @param  {number} id
   * @param  {number} currentUserId
   * @returns Promise<[number, IncidentModel[]]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async deleteIncidentById(id: number, currentUserId: number): Promise<[number, IncidentModel[]]> {
    const deletedIncident: [number, IncidentModel[]] = await this.incident.update({ isDeleted: 1, updatedBy: currentUserId }, { where: { id } });
    await this.incidentRelAlert.destroy({ where: { incidentId: id } });
    await this.incidentAction.destroy({ where: { incidentId: id } });

    return deletedIncident;
  }

  /**
   * Update an incident
   *
   * @param  {number} id
   * @param  {UpdateIncidentDto} incidentData
   * @param  {number} currentUserId
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncident(id: number, incidentData: UpdateIncidentDto, currentUserId: number): Promise<IIncident> {
    const { relatedAlertIds, actions } = incidentData;

    await this.incident.update({ ...incidentData, updatedBy: currentUserId }, { where: { id } });

    if (relatedAlertIds) {
      await this.incidentRelAlert.destroy({ where: { incidentId: id } });

      let relatedAlerts = relatedAlertIds.map(alertId => {
        return {
          incidentId: id,
          alertId,
        };
      });

      await this.incidentRelAlert.bulkCreate(relatedAlerts);
    }

    if (actions) {
      await this.incidentAction.destroy({ where: { incidentId: id } });
      let incidentActions = actions.map(action => {
        return {
          incidentId: id,
          title: action.title,
          description: action.description,
          createdBy: currentUserId,
        };
      });
      await this.incidentAction.bulkCreate(incidentActions);
    }

    return this.getIncidentById(id);
  }

  /**
   * Update the "status" field of an incident specifically
   *
   * @param  {number} id
   * @param  {UpdateIncidentStatusDto} incidentStatusData
   * @param  {number} currentUserId
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncidentStatus(id: number, incidentStatusData: UpdateIncidentStatusDto, currentUserId: number): Promise<IIncident> {
    await this.incident.update({ status: incidentStatusData.status, updatedBy: currentUserId }, { where: { id } });

    return this.getIncidentById(id);
  }

  /**
   * Create an action for an incident
   *
   * @param  {any} actionData
   * @param  {number} currentUserId
   * @param  {number} incidentId
   * @returns Promise<IIncidentAction>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async createIncidentAction(actionData: any, currentUserId: number, incidentId: number): Promise<IIncidentAction> {
    if (isEmpty(actionData)) throw new HttpException(400, 'Incident must not be empty');

    const createActionData: IIncidentAction = await this.incidentAction.create({
      createdBy: currentUserId,
      incidentId,
      ...actionData,
    });

    return createActionData;
  }

  /**
   * Update an anction within incident
   *
   * @param  {any} actionData
   * @param  {number} currentUserId
   * @param  {number} incidentId
   * @param  {number} actionId
   * @returns Promise<IIncidentAction>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncidentAction(actionData: any, currentUserId: number, incidentId: number, actionId: number): Promise<IIncidentAction> {
    if (isEmpty(actionData)) throw new HttpException(400, 'Incident must not be empty');

    await this.incidentAction.update(
      {
        updatedBy: currentUserId,
        ...actionData,
      },
      { where: { id: actionId, incidentId } },
    );

    const updateResult: IIncidentAction = await this.incidentAction.findByPk(actionId);
    return updateResult;
  }

  /**
   * Delete an action from incident
   *
   * @param  {number} incidentId
   * @param  {number} currentUserId
   * @param  {number} actionId
   * @returns Promise
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async deleteIncidentActionById(incidentId: number, currentUserId: number, actionId: number): Promise<[number, IncidentActionModel[]]> {
    const deletedIncidentAction: [number, IncidentActionModel[]] = await this.incidentAction.update(
      { isDeleted: 1, updatedBy: currentUserId },
      { where: { id: actionId, incidentId } },
    );

    return deletedIncidentAction;
  }
}

export default IncidentService;
