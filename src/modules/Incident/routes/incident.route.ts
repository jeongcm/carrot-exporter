import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import IncidentController from '@/modules/Incident/controllers/incident.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import {
  CreateIncidentDto,
  UpdateIncidentDto,
  UpdateIncidentStatusDto,
  AddAlertReceivedToIncidentDto,
  DropAlertReceivedFromIncidentDto,
} from '@/modules/Incident/dtos/incident.dto';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import { CreateIncidentActionDto } from '@/modules/Incident/dtos/incidentAction.dto';
import { CreateIncidentActionAttachmentDto } from '@/modules/Incident/dtos/incidentActionAttachment.dto';

import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class IncidentRoute implements Routes {
  public router = Router();
  public incidentController = new IncidentController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/incidents', authMiddleware, validationMiddleware(CreateIncidentDto, 'body'), this.incidentController.createIncident);
    this.router.get('/incidents', authMiddleware, this.incidentController.getIncidents);
    this.router.get('/incidents/counts', authMiddleware, this.incidentController.getIncidentCounts);
    this.router.get('/incidents/:incidentId', authMiddleware, this.incidentController.getIncident);
    this.router.put(
      '/incidents/:incidentId',
      authMiddleware,
      validationMiddleware(CreateIncidentDto, 'body'),
      this.incidentController.updateIncident,
    );
    this.router.delete('/incidents/:incidentId', authMiddleware, this.incidentController.deleteIncident);

    this.router.post(
      '/incidents/:incidentId/actions',
      authMiddleware,
      validationMiddleware(CreateIncidentActionDto, 'body'),
      this.incidentController.createIncidentAction,
    );
    this.router.get('/incidents/:incidentId/actions', authMiddleware, this.incidentController.getIncidentActions);
    this.router.put(
      '/incidents/:incidentId/actions/:actionId',
      authMiddleware,
      validationMiddleware(CreateIncidentActionDto, 'body'),
      this.incidentController.updateIncidentAction,
    );
    this.router.delete('/incidents/:incidentId/actions/:actionId', authMiddleware, this.incidentController.deleteIncidentAction);

    this.router.post(
      '/incidents/:incidentId/actions/:actionId/attachment',
      authMiddleware,
      validationMiddleware(CreateIncidentActionAttachmentDto, 'body'),
      this.incidentController.createIncidentActionAttachment,
    );

    this.router.get('/incidents/:incidentId/actions/:actionId/attachment', authMiddleware, this.incidentController.getIncidentActionAttachment);

    this.router.put(
      '/incidents/:incidentId/actions/:actionId/attachment/:attachmentId',
      authMiddleware,
      validationMiddleware(CreateIncidentActionAttachmentDto, 'body'),
      this.incidentController.updateIncidentActionAttachment,
    );

    // this.router.get('/incidents/:incidentId/relates/alerts', authMiddleware, this.incidentController.getAlertByIncident);
    // this.router.post(
    //   '/incidents/:incidentId/relates/alerts',
    //   authMiddleware,
    //   validationMiddleware(AddAlertReceivedToIncidentDto, 'body'),
    //   this.incidentController.createRelatedAlertsByIncident,
    // );
    // this.router.delete(
    //   '/incidents/:incidentId/relates/alerts',
    //   authMiddleware,
    //   validationMiddleware(DropAlertReceivedFromIncidentDto, 'body'),
    //   this.incidentController.deleteRelatedAlertsByIncident,
    // );

    this.router.put(
      '/incidents/:incidentId/status',
      authMiddleware,
      validationMiddleware(UpdateIncidentStatusDto, 'body'),
      this.incidentController.updateIncidentStatus,
    );
  }
}

export default IncidentRoute;
