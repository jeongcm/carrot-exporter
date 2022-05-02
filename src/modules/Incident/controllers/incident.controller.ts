import { IIncidentActionAttachment, IIncidentActionAttachmentResponse } from './../../../common/interfaces/incidentActionAttachment.interface';
import { NextFunction, Response } from 'express';
import { IIncident } from '@/common/interfaces/incident.interface';
import IncidentService from '@/modules/Incident/services/incident.service';
import {
  CreateIncidentDto,
  UpdateIncidentStatusDto,
  AddAlertReceivedToIncidentDto,
  DropAlertReceivedFromIncidentDto,
} from '@/modules/Incident/dtos/incident.dto';
import { IIncidentAction } from '@/common/interfaces/incidentAction.interface';
import { CreateIncidentActionDto } from '@/modules/Incident/dtos/incidentAction.dto';
import { IIncidentAlertReceived } from '@/common/interfaces/incidentAlertReceived.interface';
import { IIncidentCounts } from '@/common/interfaces/incidentCounts.interface';

import DB from '@/database';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateIncidentActionAttachmentDto } from '../dtos/incidentActionAttachment.dto';
import PartyService from '@/modules/Party/services/party.service';

class IncidentController {
  public incidentService = new IncidentService();
  public partyService = new PartyService();

  public users = DB.Users;

  public createIncident = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentData: CreateIncidentDto = req.body;

    const assignee = await this.partyService.getUser(customerAccountKey, incidentData.assigneeId);

    if (!assignee) {
      res.status(404).json({ message: `assignee user id(${incidentData.assigneeId}) not found` });
    }

    try {
      const logginedUserId = req.user.partyId;

      const createdIncident: IIncident = await this.incidentService.createIncident(customerAccountKey, logginedUserId, incidentData);

      res.status(201).json({ data: createdIncident, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getIncidents = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    try {
      const incidentsAll: IIncident[] = await this.incidentService.getAllIncidents(customerAccountKey);
      res.status(200).json({ data: incidentsAll, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getIncident = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;

    try {
      const incident: IIncident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

      if (incident) {
        res.status(200).json({ data: incident, message: `find incident id(${incidentId}) ` });
      } else {
        res.status(404).json({ message: `Incident id(${incidentId}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public updateIncident = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const incidentData: CreateIncidentDto = req.body;
      const logginedUserId = req.user.partyId;

      const updatedIncident: IIncident = await this.incidentService.updateIncident(customerAccountKey, incidentId, incidentData, logginedUserId);
      res.status(200).json({ data: updatedIncident, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteIncident = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const logginedUserId = req.user.partyId;

      await this.incidentService.deleteIncidentById(customerAccountKey, incidentId, logginedUserId);
      res.status(204).json({ message: `delete incident id(${incidentId})` });
    } catch (error) {
      next(error);
    }
  };

  public getIncidentCounts = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    try {
      const incidentCounts: IIncidentCounts = await this.incidentService.getIncidentCounts(customerAccountKey);
      res.status(200).json({ data: incidentCounts, message: 'All Counts' });
    } catch (error) {
      next(error);
    }
  };

  public updateIncidentStatus = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const incidentStatus: UpdateIncidentStatusDto = req.body;
      const logginedUserId = req.user.partyId;

      const updatedIncidentData: IIncident = await this.incidentService.updateIncidentStatus(
        customerAccountKey,
        incidentId,
        incidentStatus,
        logginedUserId,
      );
      res.status(200).json({ data: updatedIncidentData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public createIncidentAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.sendStatus(404);
    }

    try {
      const actionData: CreateIncidentActionDto = req.body;
      const logginedUserId = req.user.partyId;

      const createdActionData: IIncidentAction = await this.incidentService.createIncidentAction(
        customerAccountKey,
        incidentId,
        actionData,
        logginedUserId,
      );

      if (createdActionData) {
        res.status(201).json({ data: createdActionData, message: 'created' });
      } else {
        res.status(404).json({ message: `Incident id(${incidentId}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public getIncidentActions = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.status(404).json({ message: `Incident id(${incidentId}) not found` });
    }

    try {
      const actions: IIncidentAction[] = await this.incidentService.getIncidentActionsByIncidentId(customerAccountKey, incidentId);

      if (actions) {
        res.status(200).json({ data: actions, message: `find incident id(${incidentId})'s actions` });
      } else {
        res.status(404).json({ message: `Incident id(${incidentId})'s action not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public updateIncidentAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;
    const actionId = req.params.actionId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.status(404).json({ message: `Incident id(${incidentId}) not found` });
    }

    try {
      const actionData: CreateIncidentActionDto = req.body;
      const logginedUserId = req.user.partyId;

      const updatedActionData: IIncidentAction = await this.incidentService.updateIncidentAction(
        customerAccountKey,
        incidentId,
        actionId,
        actionData,
        logginedUserId,
      );

      if (updatedActionData) {
        res.status(201).json({ data: updatedActionData, message: 'updated' });
      } else {
        res.status(404).json({ message: `Incident id(${incidentId})'s action not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public deleteIncidentAction = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;
    const actionId = req.params.actionId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.status(404).json({ message: `Incident id(${incidentId}) not found` });
    }

    try {
      const logginedUserId = req.user.partyId;

      const deletedIncidentAction = await this.incidentService.deleteIncidentActionById(customerAccountKey, incidentId, actionId, logginedUserId);

      if (deletedIncidentAction) {
        res.status(204).json({ message: `delete incident action id(${actionId})` });
      } else {
        res.status(404).json({ message: `Incident id(${incidentId})'s action (actionId : ${actionId}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public createIncidentActionAttachment = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;
    const actionId = req.params.actionId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.status(404).json({ message: `Incident id(${incidentId}) not found` });
    }

    try {
      const actionAttachmentData: CreateIncidentActionAttachmentDto = req.body;
      const logginedUserId = req.user.partyId;

      const createdActionAttachment: IIncidentActionAttachment = await this.incidentService.createIncidentActionAttachment(
        customerAccountKey,
        incidentId,
        actionId,
        actionAttachmentData,
        logginedUserId,
      );

      if (createdActionAttachment) {
        res.status(201).json({ data: createdActionAttachment, message: 'created' });
      } else {
        res.status(404).json({ message: `Incident id(${incidentId})'s action (actionId : ${actionId}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public getIncidentActionAttachment = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;
    const actionId = req.params.actionId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.status(404).json({ message: `Incident id(${incidentId}) not found` });
    }

    try {
      const incidentActionAttachments: IIncidentActionAttachment[] = await this.incidentService.getIncidentActionAttachment(
        customerAccountKey,
        incidentId,
        actionId,
      );

      if (incidentActionAttachments) {
        res.status(200).json({ data: incidentActionAttachments, message: `find incidentAction id(${actionId})'s attachments` });
      } else {
        res.status(404).json({ message: `Incident id(${incidentId})'s action(id: ${actionId}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public updateIncidentActionAttachment = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;
    const actionId = req.params.actionId;
    const attachmentId = req.params.attachmentId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.status(404).json({ message: `Incident id(${incidentId}) not found` });
    }

    const incidentAction = await this.incidentService.getIncidentActionByActionId(actionId);

    if (!incidentAction) {
      return res.status(404).json({ message: `Incident Action id(${actionId}) not found` });
    }

    try {
      const actionAttachmentData: CreateIncidentActionAttachmentDto = req.body;
      const logginedUserId = req.user.partyId;

      const updatedActionAttachment: IIncidentActionAttachmentResponse = await this.incidentService.updateIncidentActionAttachment(
        customerAccountKey,
        incidentId,
        actionId,
        attachmentId,
        actionAttachmentData,
        logginedUserId,
      );

      if (updatedActionAttachment) {
        res.status(200).json({ data: updatedActionAttachment, message: 'updated' });
      } else {
        res.status(404).json({ message: `Incident action attachment (Id : ${attachmentId}) not found` });
      }
    } catch (error) {
      next(error);
    }
  };

  public addAlertReceivedtoIncident = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.status(404).json({ message: `Incident id(${incidentId}) not found` });
    }

    try {
      const addAlertReceivedData: AddAlertReceivedToIncidentDto = req.body;
      const logginedUserId = req.user.partyId;

      const addAlertReceived: any = await this.incidentService.addAlertReceivedtoIncident(
        customerAccountKey,
        incidentId,
        addAlertReceivedData,
        logginedUserId,
      );

      if (addAlertReceived === 'alertReceivedId error') {
        return res.status(404).json({ message: `Check AlertReceivedIds (${addAlertReceivedData?.alertReceivedIds}) again.` });
      } else if (addAlertReceived) {
        return res.status(201).json({ message: 'added' });
      }
    } catch (error) {
      next(error);
    }
  };

  public dropAlertReceivedfromIncident = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const incidentId = req.params.incidentId;

    const incident = await this.incidentService.getIncidentById(customerAccountKey, incidentId);

    if (!incident) {
      return res.status(404).json({ message: `Incident id(${incidentId}) not found` });
    }

    try {
      const dropAlertReceivedData: DropAlertReceivedFromIncidentDto = req.body;
      const logginedUserId = req.user.partyId;

      const dropAlertReceived: any = await this.incidentService.dropAlertReceivedfromIncident(
        customerAccountKey,
        incidentId,
        dropAlertReceivedData,
        logginedUserId,
      );

      if (dropAlertReceived === 'alertReceivedId error') {
        return res.status(404).json({ message: `Check AlertReceivedIds (${dropAlertReceivedData?.alertReceivedIds}) again.` });
      } else if (dropAlertReceived === 'deleted') {
        res.status(204).json({ message: 'deleted' });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default IncidentController;
