import { NextFunction, Request, Response } from 'express';
import { IIncident } from '@/interfaces/incident.interface';
import IncidentService from '@/services/incident.service';
import { CreateIncidentDto } from '@dtos/incident.dto';
import { currentUser } from '@/utils/currentUser';

class IncidentController {
  public incidentService = new IncidentService();

  public getIncidents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allIncidents: IIncident[] = await this.incidentService.getAllIncidents();
      res.status(200).json({ data: allIncidents, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getIncident = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);

    try {
      const incident: IIncident = await this.incidentService.getIncidentById(id);

      if (incident) {
        res.status(200).json({ data: incident, message: `find incident id(${id}) ` });
      } else {
        res.status(404).json({ message: `Incident id(${id}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public createIncident = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incidentData: CreateIncidentDto = req.body;
      let currentUserId = currentUser(req).id;
      const createAlertData: IIncident = await this.incidentService.createIncident(incidentData, currentUserId);
      res.status(201).json({ data: createAlertData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public deleteIncident = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const incident = await this.incidentService.getIncidentById(id);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      let currentUserId = currentUser(req).id;
      await this.incidentService.deleteIncidentById(id, currentUserId);
      res.status(204).json({ message: `delete incident id(${id})` });
    } catch (error) {
      next(error);
    }
  };

  public updateIncident = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incidentId = parseInt(req.params.id);
      const incidentData: CreateIncidentDto = req.body;
      let currentUserId = currentUser(req).id;

      const updateAlertData: IIncident = await this.incidentService.updateIncident(incidentId, incidentData, currentUserId);
      res.status(200).json({ data: updateAlertData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default IncidentController;
