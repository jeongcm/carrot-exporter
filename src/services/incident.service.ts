import _ from 'lodash';
import DB from 'databases';
import { IIncident } from '@/interfaces/incident.interface';
import { CreateIncidentDto, UpdateIncidentStatusDto } from '@dtos/incident.dto';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { IncidentModel } from '@/models/incident.model';
import { IIncidentAction } from '@/interfaces/incidentAction.interface';
import { UserModel } from '@/models/users.model';
import { CreateActionDto } from '@/dtos/incidentAction.dto';
import { IncidentActionModel } from '@/models/incidentAction.model';
import { AlertModel } from '@/models/alert.model';
import { IIncidentRelAlert } from '@/interfaces/incidentRelAlert.interface';
import { IIncidentCounts } from '@/interfaces/incidentCounts.interface';

class IncidentService {
  public incident = DB.Incident;
  public alert = DB.Alerts;
  public incidentRelAlert = DB.IncidentRelAlert;
  public incidentAction = DB.IncidentAction;

  public async getAllIncidents(): Promise<IIncident[]> {
    const allIncidents: IIncident[] = await this.incident.findAll({
      where: { isDeleted: 0 },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['isDeleted', 'assigneeId'] },
      include: [
        {
          as: 'assignee',
          model: UserModel,
          attributes: ['email', 'lastAccess', 'username', 'photo'],
        },
      ],
    });
    return allIncidents;
  }

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

  public async getAlertsByIncidentId(id: number): Promise<IIncidentRelAlert[]> {
    const alerts: IIncidentRelAlert[] = await this.incidentRelAlert.findAll({
      where: { incidentId: id },
      include: [
        {
          model: AlertModel,
          attributes: { exclude: ['tenancyId', 'alertRule', 'note', 'node', 'numberOfOccurrences'] },
          include: [
            {
              model: IncidentModel,
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

  public async getIncidentActionsById(id: number): Promise<IIncidentAction[]> {
    const incidentActions: IIncidentAction[] = await this.incidentAction.findAll({
      where: { incidentId: id, isDeleted: 0 },
      attributes: { exclude: ['isDeleted'] },
    });

    return incidentActions;
  }

  public async getIncidentCounts(): Promise<IIncidentCounts> {
    const closedAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'CLOSED' },
    });
    const inprogressAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'IN_PROGRESS' },
    });
    const openAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'OPEN' },
    });
    const resolvedAmount = await this.incident.count({
      where: { isDeleted: 0, status: 'RESOLVED' },
    });

    const incidentCounts: IIncidentCounts = {
      closedCount: closedAmount,
      inprogressCount: inprogressAmount,
      openCount: openAmount,
      resolvedCount: resolvedAmount,
    };

    return incidentCounts;
  }

  public async createIncident(incidentData: CreateIncidentDto, currentUserId: string): Promise<IIncident> {
    if (isEmpty(incidentData)) throw new HttpException(400, 'Incident must not be empty');

    const { assigneeId, title, note, status, priority, dueDate, relatedAlertIds, actions } = incidentData;

    const createIncidentData: any = await this.incident.create({
      assigneeId,
      title,
      note,
      status,
      priority,
      dueDate,
      tenancyId: 1,
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

  public async deleteIncidentById(id: number, currentUserId: string): Promise<[number, IncidentModel[]]> {
    const deletedIncident: [number, IncidentModel[]] = await this.incident.update({ isDeleted: 1, updatedBy: currentUserId }, { where: { id } });
    await this.incidentRelAlert.destroy({ where: { incidentId: id } });
    await this.incidentAction.destroy({ where: { incidentId: id } });

    return deletedIncident;
  }

  public async updateIncident(id: number, incidentData: CreateIncidentDto, currentUserId: string): Promise<IIncident> {
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

  public async updateIncidentStatus(id: number, incidentStatusData: UpdateIncidentStatusDto, currentUserId: string): Promise<IIncident> {
    await this.incident.update({ status: incidentStatusData.status, updatedBy: currentUserId }, { where: { id } });

    return this.getIncidentById(id);
  }

  public async createIncidentAction(actionData: any, currentUserId: string, incidentId: number): Promise<IIncidentAction> {
    if (isEmpty(actionData)) throw new HttpException(400, 'Incident must not be empty');

    const createActionData: IIncidentAction = await this.incidentAction.create({
      createdBy: currentUserId,
      incidentId,
      ...actionData,
    });

    return createActionData;
  }

  public async updateIncidentAction(actionData: any, currentUserId: string, incidentId: number, actionId: number): Promise<IIncidentAction> {
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

  public async deleteIncidentActionById(incidentId: number, currentUserId: string, actionId: number): Promise<[number, IncidentActionModel[]]> {
    const deletedIncidentAction: [number, IncidentActionModel[]] = await this.incidentAction.update(
      { isDeleted: 1, updatedBy: currentUserId },
      { where: { id: actionId, incidentId } },
    );

    return deletedIncidentAction;
  }
}

export default IncidentService;
