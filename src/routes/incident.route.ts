import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import IncidentController from '@/controllers/incident.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateIncidentDto, UpdateIncidentStatusDto, UpdateIncidentDto } from '@dtos/incident.dto';
import AuthService from '@/services/auth.service';
import { CreateActionDto } from '@/dtos/incidentAction.dto';
import authMiddleware from '@middlewares/auth.middleware';

class IncidentRoute implements Routes {
  public path = '/incidents';
  public router = Router();
  public incidentController = new IncidentController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.incidentController.getIncidents);
    this.router.get(`${this.path}/counts`, authMiddleware, this.incidentController.getIncidentCounts);
    this.router.get(`${this.path}/:id`, authMiddleware, this.incidentController.getIncident);
    this.router.get(`${this.path}/:id/actions`, authMiddleware, this.incidentController.getIncidentActions);
    this.router.post(
      `${this.path}/:id/actions`,
      authMiddleware,
      validationMiddleware(CreateActionDto, 'body'),
      this.incidentController.createIncidentAction,
    );
    this.router.put(
      `${this.path}/:incidentId/actions/:actionId`,
      authMiddleware,
      validationMiddleware(CreateActionDto, 'body'),
      this.incidentController.updateIncidentAction,
    );
    this.router.delete(`${this.path}/:incidentId/actions/:actionId`, authMiddleware, this.incidentController.deleteIncidentAction);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateIncidentDto, 'body'), this.incidentController.createIncident);
    this.router.get(`${this.path}/:incidentId/relates/alerts`, authMiddleware, this.incidentController.getAlertByIncident);
    this.router.delete(`${this.path}/:id`, authMiddleware, this.incidentController.deleteIncident);
    this.router.put(`${this.path}/:id`, authMiddleware, validationMiddleware(UpdateIncidentDto, 'body'), this.incidentController.updateIncident);

    this.router.put(
      `${this.path}/:id/status`,
      authMiddleware,
      validationMiddleware(UpdateIncidentStatusDto, 'body'),
      this.incidentController.updateIncidentStatus,
    );
  }
}

export default IncidentRoute;
