import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import IncidentController from '@/controllers/incident.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateIncidentDto } from '@dtos/incident.dto';
import AuthService from '@/services/auth.service';
import { CreateActionDto } from '@/dtos/incidentAction.dto';

class IncidentRoute implements Routes {
  public path = '/incidents';
  public router = Router();
  public incidentController = new IncidentController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.authservice.authenticate, this.incidentController.getIncidents);
    this.router.get(`${this.path}/:id`, this.authservice.authenticate, this.incidentController.getIncident);
    this.router.get(`${this.path}/:id/actions`, this.authservice.authenticate, this.incidentController.getIncidentActions);
    this.router.post(
      `${this.path}/:id/actions`,
      this.authservice.authenticate,
      validationMiddleware(CreateActionDto, 'body'),
      this.incidentController.createIncidentAction,
    );
    this.router.put(
      `${this.path}/:incidentId/actions/:actionId`,
      this.authservice.authenticate,
      validationMiddleware(CreateActionDto, 'body'),
      this.incidentController.updateIncidentAction,
    );

    this.router.post(
      `${this.path}`,
      this.authservice.authenticate,
      validationMiddleware(CreateIncidentDto, 'body'),
      this.incidentController.createIncident,
    );
    this.router.delete(`${this.path}/:id`, this.authservice.authenticate, this.incidentController.deleteIncident);
    this.router.put(
      `${this.path}/:id`,
      this.authservice.authenticate,
      validationMiddleware(CreateIncidentDto, 'body'),
      this.incidentController.updateIncident,
    );
  }
}

export default IncidentRoute;
