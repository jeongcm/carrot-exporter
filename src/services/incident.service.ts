import DB from 'databases';
import { IIncident } from '@/interfaces/incident.interface';
import { CreateIncidentDto } from '@dtos/incident.dto';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { IncidentModel } from '@/models/incident.model';
import { IIncidentAction } from '@/interfaces/incident_action.interface';

class IncidentService {
  public incident = DB.Incident;
  public incident_rel_alert = DB.Incident_Rel_Alert;
  public incident_action = DB.Incident_Action;

  public async getAllIncidents(): Promise<IIncident[]> {
    const allIncidents: IIncident[] = await this.incident.findAll({
      where: { isDeleted: 0 },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['isDeleted'] },
    });
    return allIncidents;
  }

  public async getIncidentById(id: number): Promise<IIncident> {
    const incident: IIncident = await this.incident.findOne({ where: { id }, attributes: { exclude: ['isDeleted'] } });

    return incident;
  }

  public async getIncidentActionsById(id: number): Promise<IIncidentAction[]> {
    const incidentActions: IIncidentAction[] = await this.incident_action.findAll({
      where: { incidentId: id },
      attributes: { exclude: ['isDeleted'] },
    });

    return incidentActions;
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
      await this.incident_rel_alert.bulkCreate(relatedAlerts);
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
      await this.incident_action.bulkCreate(incidentActions);
    }

    return createIncidentData;
  }

  public async deleteIncidentById(id: number, currentUserId: string): Promise<[number, IncidentModel[]]> {
    const deletedIncident: [number, IncidentModel[]] = await this.incident.update({ isDeleted: 1, updatedBy: currentUserId }, { where: { id } });
    await this.incident_rel_alert.destroy({ where: { incidentId: id } });
    await this.incident_action.destroy({ where: { incidentId: id } });

    return deletedIncident;
  }

  public async updateIncident(id: number, incidentData: CreateIncidentDto, currentUserId: string): Promise<IIncident> {
    const { relatedAlertIds, actions } = incidentData;

    await this.incident.update({ ...incidentData, updatedBy: currentUserId }, { where: { id } });

    if (relatedAlertIds) {
      await this.incident_rel_alert.destroy({ where: { incidentId: id } });
      let relatedAlerts = relatedAlertIds.map(alertId => {
        return {
          incidentId: id,
          alertId,
        };
      });

      await this.incident_rel_alert.bulkCreate(relatedAlerts);
    }

    if (actions) {
      await this.incident_action.destroy({ where: { incidentId: id } });
      let incidentActions = actions.map(action => {
        return {
          incidentId: id,
          title: action.title,
          description: action.description,
          createdBy: currentUserId,
        };
      });
      await this.incident_action.bulkCreate(incidentActions);
    }

    return this.getIncidentById(id);
  }
}

export default IncidentService;
