import { NextFunction, Request, Response } from 'express';
import { IIncident } from '@/interfaces/incident.interface';
import IncidentService from '@/services/incident.service';
import { CreateIncidentDto, UpdateIncidentStatusDto, UpdateIncidentDto } from '@dtos/incident.dto';
import { IIncidentAction } from '@/interfaces/incidentAction.interface';
import { CreateActionDto } from '@/dtos/incidentAction.dto';
import { IAlert } from '@/interfaces/alert.interface';
import { IIncidentRelAlert } from '@/interfaces/incidentRelAlert.interface';
import { IIncidentCounts } from '@/interfaces/incidentCounts.interface';

class IncidentController {
  public incidentService = new IncidentService();

  public getIncidents = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error
    const currentTenancyId = req.user.currentTenancyId;

    try {
      const allIncidents: IIncident[] = await this.incidentService.getAllIncidents(currentTenancyId);
      res.status(200).json({ data: allIncidents, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getIncident = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    // @ts-expect-error
    const currentTenancyId = req.user.currentTenancyId;

    try {
      const incident: IIncident = await this.incidentService.getIncidentById(id);

      if (incident.tenancyId !== currentTenancyId) {
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

  public getAlertByIncident = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.incidentId);

    try {
      const alerts: IIncidentRelAlert[] = await this.incidentService.getAlertsByIncidentId(id);

      if (alerts) {
        res.status(200).json({ data: alerts, message: `find alerts related to incident id (${id}) ` });
      } else {
        res.status(404).json({ message: `Incident id(${id}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public getIncidentActions = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
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

  public getIncidentCounts = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error
    const currentTenancyId = req.user.currentTenancyId;

    try {
      const incidentCounts: IIncidentCounts = await this.incidentService.getIncidentCounts(currentTenancyId);
      res.status(200).json({ data: incidentCounts, message: 'All Counts' });
    } catch (error) {
      next(error);
    }
  };

  public createIncident = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incidentData: CreateIncidentDto = req.body;

      //@ts-expect-error
      const currentUserId = req.user.id;
      // @ts-expect-error
      const currentTenancyId = req.user.currentTenancyId;

      const createAlertData: IIncident = await this.incidentService.createIncident(incidentData, currentUserId, currentTenancyId);
      res.status(201).json({ data: createAlertData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteIncident = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    // @ts-expect-error
    const currentTenancyId = req.user.currentTenancyId;

    const incident = await this.incidentService.getIncidentById(id);

    if (!incident) {
      return res.sendStatus(404);
    }

    if (incident.tenancyId !== currentTenancyId) {
      return res.sendStatus(404);
    }

    try {
      //@ts-expect-error
      const currentUserId = req.user.id;

      await this.incidentService.deleteIncidentById(id, currentUserId);
      res.status(204).json({ message: `delete incident id(${id})` });
    } catch (error) {
      next(error);
    }
  };

  public updateIncident = async (req: Request, res: Response, next: NextFunction) => {
    const incidentId = parseInt(req.params.id);
    // @ts-expect-error
    const currentTenancyId = req.user.currentTenancyId;

    const incident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    if (incident.tenancyId !== currentTenancyId) {
      return res.sendStatus(404);
    }

    try {
      const incidentData: UpdateIncidentDto = req.body;
      //@ts-expect-error
      const currentUserId = req.user.id;

      const updateAlertData: IIncident = await this.incidentService.updateIncident(incidentId, incidentData, currentUserId);
      res.status(200).json({ data: updateAlertData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateIncidentStatus = async (req: Request, res: Response, next: NextFunction) => {
    const incidentId = parseInt(req.params.id);
    const incident: IIncident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const incidentStatus: UpdateIncidentStatusDto = req.body;
      //@ts-expect-error
      const currentUserId = req.user.id;

      const updateIncidentData: IIncident = await this.incidentService.updateIncidentStatus(incidentId, incidentStatus, currentUserId);
      res.status(200).json({ data: updateIncidentData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public createIncidentAction = async (req: Request, res: Response, next: NextFunction) => {
    const incidentId = parseInt(req.params.id);
    const incident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const actionData: CreateActionDto = req.body;
      //@ts-expect-error
      const currentUserId = req.user.id;

      const createActionData: IIncidentAction = await this.incidentService.createIncidentAction(actionData, currentUserId, incidentId);
      res.status(201).json({ data: createActionData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateIncidentAction = async (req: Request, res: Response, next: NextFunction) => {
    const incidentId = parseInt(req.params.incidentId);
    const actionId = parseInt(req.params.actionId);

    const incident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const actionData: CreateActionDto = req.body;
      //@ts-expect-error
      const currentUserId = req.user.id;

      const updateActionData: IIncidentAction = await this.incidentService.updateIncidentAction(actionData, currentUserId, incidentId, actionId);
      res.status(201).json({ data: updateActionData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteIncidentAction = async (req: Request, res: Response, next: NextFunction) => {
    const incidentId = parseInt(req.params.incidentId);
    const actionId = parseInt(req.params.actionId);

    const incident = await this.incidentService.getIncidentById(incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      //@ts-expect-error
      const currentUserId = req.user.id;

      await this.incidentService.deleteIncidentActionById(incidentId, currentUserId, actionId);
      res.status(204).json({ message: `delete incident action id(${actionId})` });
    } catch (error) {
      next(error);
    }
  };
}

export default IncidentController;
