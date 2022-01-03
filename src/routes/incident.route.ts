import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import IncidentController from '@/controllers/incident.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateIncidentDto, UpdateIncidentStatusDto, UpdateIncidentDto } from '@dtos/incident.dto';
import AuthService from '@/services/auth.service';
import { CreateActionDto } from '@/dtos/incidentAction.dto';
import authMiddleware from '@middlewares/auth.middleware';

class IncidentRoute implements Routes {
  public router = Router();
  public incidentController = new IncidentController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/incidents', authMiddleware, this.incidentController.getIncidents);
    this.router.get('/incidents/counts', authMiddleware, this.incidentController.getIncidentCounts);
    this.router.get('/incidents/:id', authMiddleware, this.incidentController.getIncident);
    this.router.get('/incidents/:id/actions', authMiddleware, this.incidentController.getIncidentActions);
    this.router.post(
      '/incidents/:id/actions',
      authMiddleware,
      validationMiddleware(CreateActionDto, 'body'),
      this.incidentController.createIncidentAction,
    );
    this.router.put(
      '/incidents/:incidentId/actions/:actionId',
      authMiddleware,
      validationMiddleware(CreateActionDto, 'body'),
      this.incidentController.updateIncidentAction,
    );
    this.router.delete('/incidents/:incidentId/actions/:actionId', authMiddleware, this.incidentController.deleteIncidentAction);
    this.router.post('/incidents', authMiddleware, validationMiddleware(CreateIncidentDto, 'body'), this.incidentController.createIncident);
    this.router.get('/incidents/:incidentId/relates/alerts', authMiddleware, this.incidentController.getAlertByIncident);
    this.router.delete('/incidents/:id', authMiddleware, this.incidentController.deleteIncident);
    this.router.put('/incidents/:id', authMiddleware, validationMiddleware(UpdateIncidentDto, 'body'), this.incidentController.updateIncident);

    this.router.put(
      '/incidents/:id/status',
      authMiddleware,
      validationMiddleware(UpdateIncidentStatusDto, 'body'),
      this.incidentController.updateIncidentStatus,
    );
  }
}

export default IncidentRoute;
