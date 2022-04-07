import { NextFunction, Request, Response } from 'express';
import { IIncident } from '@/common/interfaces/incident.interface';
import IncidentService from '@/modules/Incident/services/incident.service';
import { CreateIncidentDto, UpdateIncidentStatusDto, UpdateIncidentDto, CreateRelatedAlertDto } from '@/modules/Incident/dtos/incident.dto';
import { IIncidentAction } from '@/common/interfaces/incidentAction.interface';
import { CreateActionDto } from '@/modules/Incident/dtos/incidentAction.dto';
import { IIncidentRelAlert } from '@/common/interfaces/incidentRelAlert.interface';
import { IIncidentCounts } from '@/common/interfaces/incidentCounts.interface';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
import DB from '@/database';

class IncidentController {
  public incidentService = new IncidentService();
  public users = DB.Users;

  public getIncidents = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const currentTenancyPk = req.user.currentTenancyPk;

    try {
      const allIncidents: IIncident[] = await this.incidentService.getAllIncidents(currentTenancyPk);
      res.status(200).json({ data: allIncidents, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getIncident = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const currentTenancyPk = req.user.currentTenancyPk;

    try {
      const incident: IIncident = await this.incidentService.getIncidentById(id);

      if (incident.tenancyPk !== currentTenancyPk) {
        res.status(404).json({ message: `Incident id(${id}) not found` });
      } else if (incident) {
        res.status(200).json({ data: incident, message: `find incident id(${id}) ` });
      } else {
        res.status(404).json({ message: `Incident id(${id}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public getAlertByIncident = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.incidentId;
    const currentTenancyPk = req.user.currentTenancyPk;

    try {
      const alerts: IIncidentRelAlert[] = await this.incidentService.getAlertsByIncidentId(id, currentTenancyPk);

      if (alerts) {
        res.status(200).json({ data: alerts, message: `find alerts related to incident id (${id}) ` });
      } else {
        res.status(404).json({ message: `Incident id(${id}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public createRelatedAlertsByIncident = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const incidentId = req.params.incidentId;
    const relatedAlertData: CreateRelatedAlertDto = req.body;

    try {
      const relatedAlerts: IIncidentRelAlert[] = await this.incidentService.createRelatedAlertsByIncident(incidentId, relatedAlertData);

      if (relatedAlerts) {
        res.status(200).json({ data: relatedAlerts, message: `alerts have been connected to the incident(id: ${incidentId}).` });
      } else {
        res.status(404).json({ message: `Incident id(${incidentId}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public deleteRelatedAlertsByIncident = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const incidentId = req.params.incidentId;
    const relatedAlertData: CreateRelatedAlertDto = req.body;

    try {
      await this.incidentService.deleteRelatedAlertsByIncident(incidentId, relatedAlertData);
      res.status(204).json({ message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getIncidentActions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;
    try {
      const actions: IIncidentAction[] = await this.incidentService.getIncidentActionsById(id);

      if (actions) {
        res.status(200).json({ data: actions, message: `find incident id(${id})'s actions` });
      } else {
        res.status(404).json({ message: `Incident id(${id})'s action not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public getIncidentCounts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const currentTenancyPk = req.user.currentTenancyPk;

    try {
      const incidentCounts: IIncidentCounts = await this.incidentService.getIncidentCounts(currentTenancyPk);
      res.status(200).json({ data: incidentCounts, message: 'All Counts' });
    } catch (error) {
      next(error);
    }
  };

  public createIncident = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const incidentData: CreateIncidentDto = req.body;
      const currentUserPk = req.user.pk;
      const currentTenancyPk = req.user.currentTenancyPk;
      const assigneeDetail = await this.users.findOne({ where: { id: req.body.assigneeId } });

      const createAlertData: IIncident = await this.incidentService.createIncident(incidentData, currentUserPk, currentTenancyPk, assigneeDetail.pk);
      res.status(201).json({ data: createAlertData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteIncident = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const currentTenancyPk = req.user.currentTenancyPk;

    const incident = await this.incidentService.getIncidentById(id);

    if (!incident) {
      return res.sendStatus(404);
    }

    if (incident.tenancyPk !== currentTenancyPk) {
      return res.sendStatus(404);
    }

    try {
      const currentUserPk = req.user.pk;

      await this.incidentService.deleteIncidentById(id, currentUserPk);
      res.status(204).json({ message: `delete incident id(${id})` });
    } catch (error) {
      next(error);
    }
  };

  public updateIncident = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const incidentId = req.params.id;
    const currentTenancyPk = req.user.currentTenancyPk;

    const incident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    if (incident.tenancyPk !== currentTenancyPk) {
      return res.sendStatus(404);
    }

    try {
      const incidentData: UpdateIncidentDto = req.body;
      const currentUserPk = req.user.pk;

      const updateIncidentData: IIncident = await this.incidentService.updateIncident(incidentId, incidentData, currentUserPk);
      res.status(200).json({ data: updateIncidentData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateIncidentStatus = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const incidentId = req.params.id;
    const incident: IIncident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const incidentStatus: UpdateIncidentStatusDto = req.body;
      const currentUserPk = req.user.pk;

      const updateIncidentData: IIncident = await this.incidentService.updateIncidentStatus(incidentId, incidentStatus, currentUserPk);
      res.status(200).json({ data: updateIncidentData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public createIncidentAction = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const incidentId = req.params.id;
    const incident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const actionData: CreateActionDto = req.body;
      const currentUserPk = req.user.pk;

      const createActionData: IIncidentAction = await this.incidentService.createIncidentAction(actionData, currentUserPk, incidentId);
      res.status(201).json({ data: createActionData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateIncidentAction = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const incidentId = req.params.incidentId;
    const actionId = req.params.actionId;

    try {
      const actionData: CreateActionDto = req.body;
      const currentUserPk = req.user.pk;

      const updateActionData: IIncidentAction = await this.incidentService.updateIncidentAction(actionData, currentUserPk, incidentId, actionId);
      res.status(201).json({ data: updateActionData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteIncidentAction = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const incidentId = req.params.incidentId;
    const actionId = req.params.actionId;

    const incident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const currentUserPk = req.user.pk;

      await this.incidentService.deleteIncidentActionById(incidentId, currentUserPk, actionId);
      res.status(204).json({ message: `delete incident action id(${actionId})` });
    } catch (error) {
      next(error);
    }
  };
}

export default IncidentController;
