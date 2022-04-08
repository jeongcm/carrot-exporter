import { IncidentActionAttachmentModel } from '@/modules/Incident/models/incidentActionAttachment.model';
import { IIncidentActionAttachment, IIncidentActionAttachmentResponse } from './../../../common/interfaces/incidentActionAttachment.interface';
import _ from 'lodash';
import DB from '@/database';
import { IIncident } from '@/common/interfaces/incident.interface';
import {
  CreateIncidentDto,
  UpdateIncidentStatusDto,
  AddAlertReceivedToIncidentDto,
  DropAlertReceivedFromIncidentDto,
} from '@/modules/Incident/dtos/incident.dto';
import { CreateIncidentActionDto } from '@/modules/Incident/dtos/incidentAction.dto';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { IncidentModel } from '@/modules/Incident/models/incident.model';
import { IIncidentAction } from '@/common/interfaces/incidentAction.interface';
import { IncidentActionModel } from '@/modules/Incident/models/incidentAction.model';
import { AlertModel } from '@/modules/Alert/models/alert.model';
import { IIncidentAlertReceived } from '@/common/interfaces/incidentAlertReceived.interface';
import { IIncidentCounts } from '@/common/interfaces/incidentCounts.interface';
import sequelize from 'sequelize';
import { Op } from 'sequelize';
import { PartyModel } from '@/modules/Party/models/party.model';
import PartyService from '@/modules/Party/services/party.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { PartyUserModel } from '@/modules/Party/models/partyUser.model';
import { CreateIncidentActionAttachmentDto } from '../dtos/incidentActionAttachment.dto';

/**
 * @memberof Incident
 */
class IncidentService {
  public incident = DB.Incident;
  public alert = DB.Alerts;
  public incidentAlertReceived = DB.IncidentAlertReceived;
  public incidentAction = DB.IncidentAction;
  public incidentActionAttachment = DB.IncidentActionAttachment;
  public alertReceived = DB.AlertReceived;

  public partyService = new PartyService();
  public tableIdService = new TableIdService();

  /**
   * Create a new incident
   *
   * @param  {number} customerAccountKey
   * @param  {string} logginedUserId
   * @param  {CreateIncidentDto} incidentData
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async createIncident(customerAccountKey: number, logginedUserId: string, incidentData: CreateIncidentDto): Promise<IIncident> {
    if (isEmpty(incidentData)) throw new HttpException(400, 'Incident must not be empty');

    const tableIdTableName = 'Incident';
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    if (!tableId) {
      return;
    }

    try {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const assignee = await this.partyService.getUserKey(customerAccountKey, incidentData.assigneeId);

      const createIncidentData: any = await this.incident.create({
        ...incidentData,
        assigneeKey: assignee.partyKey,
        customerAccountKey,
        createdBy: logginedUserId,
        incidentId: responseTableIdData.tableIdFinalIssued,
      });

      return createIncidentData;
    } catch (error) {}
  }

  /**
   * Get all incidents in the customerAccount
   *
   * @param  {number} customerAccountKey
   * @returns Promise<IIncident[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getAllIncidents(customerAccountKey: number): Promise<IIncident[]> {
    const allIncidents: IIncident[] = await this.incident.findAll({
      where: { deletedAt: null, customerAccountKey },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['incidentKey', 'customerAccountKey', 'assigneeKey', 'deletedAt'] },
      include: [
        {
          as: 'assignee',
          model: PartyModel,
          attributes: ['partyId', 'partyName', 'partyDescription', 'partyType'],
          include: [
            {
              model: PartyUserModel,
              attributes: ['partyUserId', 'firstName', 'lastName', 'userId', 'mobile', 'email', 'lastAccessAt'],
            },
          ],
        },
      ],
    });
    return allIncidents;
  }

  /**
   * Get an incident by id
   *
   * @param  {string} incidentId
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentById(customerAccountKey: number, incidentId: string): Promise<IIncident> {
    const incident: IIncident = await this.incident.findOne({
      where: { deletedAt: null, incidentId, customerAccountKey },
      attributes: { exclude: ['incidentKey', 'customerAccountKey', 'assigneeKey', 'deletedAt'] },
      include: [
        {
          as: 'assignee',
          model: PartyModel,
          attributes: ['partyId', 'partyName', 'partyDescription', 'partyType'],
          include: [
            {
              model: PartyUserModel,
              attributes: ['partyUserId', 'firstName', 'lastName', 'userId', 'mobile', 'email', 'lastAccessAt'],
            },
          ],
        },
      ],
    });

    return incident;
  }
  /**
   * Get an incidentKey by id
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentKey(customerAccountKey: number, incidentId: string): Promise<IIncident> {
    const incident: IIncident = await this.incident.findOne({
      where: { deletedAt: null, incidentId, customerAccountKey },
      attributes: ['incidentKey'],
    });

    return incident;
  }

  /**
   * Update an incident
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @param  {CreateIncidentDto} incidentData
   * @param  {string} logginedUserId
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncident(
    customerAccountKey: number,
    incidentId: string,
    incidentData: CreateIncidentDto,
    logginedUserId: string,
  ): Promise<IIncident> {
    try {
      const assignee = await this.partyService.getUserKey(customerAccountKey, incidentData?.assigneeId);

      await this.incident.update(
        { ...incidentData, updatedBy: logginedUserId, assigneeKey: assignee?.partyKey },
        { where: { customerAccountKey, incidentId } },
      );

      return this.getIncidentById(customerAccountKey, incidentId);
    } catch (error) {}
  }

  /**
   * Delete an incident
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @param  {string} logginedUserId
   * @returns Promise<[number, IncidentModel[]]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async deleteIncidentById(customerAccountKey: number, incidentId: string, logginedUserId: string): Promise<[number, IncidentModel[]]> {
    try {
      return await DB.sequelize.transaction(async t => {
        const deletedIncident: [number, IncidentModel[]] = await this.incident.update(
          { deletedAt: new Date(), updatedBy: logginedUserId },
          { where: { customerAccountKey, incidentId }, transaction: t },
        );

        // FIXME : Should update the incidentAlertReceived table too.
        // await this.incidentRelAlert.destroy({ where: { incidentPk: id } });

        const { incidentKey } = await this.getIncidentKey(customerAccountKey, incidentId);

        await this.incidentAction.update({ deletedAt: new Date(), updatedBy: logginedUserId }, { where: { incidentKey }, transaction: t });

        return deletedIncident;
      });
    } catch (error) {}
  }

  /**
   * Get numbers of incidents status.
   *
   * For eg:
   * openCount: 2
   * inprogressCount: 5
   * resolvedCount: 3
   * closedCount: 3
   *
   * @param  {number} customerAccountKey
   * @returns Promise<IIncidentCounts>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentCounts(customerAccountKey: number): Promise<IIncidentCounts> {
    const openAmount = await this.incident.count({
      where: { deletedAt: null, incidentStatus: 'OP', customerAccountKey },
    });
    const inprogressAmount = await this.incident.count({
      where: { deletedAt: null, incidentStatus: 'IP', customerAccountKey },
    });
    const resolvedAmount = await this.incident.count({
      where: { deletedAt: null, incidentStatus: 'RS', customerAccountKey },
    });
    const closedAmount = await this.incident.count({
      where: { deletedAt: null, incidentStatus: 'CL', customerAccountKey },
    });

    const incidentCounts: IIncidentCounts = {
      openCount: openAmount,
      inProgressCount: inprogressAmount,
      resolvedCount: resolvedAmount,
      closedCount: closedAmount,
    };

    return incidentCounts;
  }

  /**
   * Update the "status" field of an incident specifically
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @param  {UpdateIncidentStatusDto} incidentStatus
   * @param  {string} logginedUserId
   * @returns Promise<IIncident>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncidentStatus(
    customerAccountKey: number,
    incidentId: string,
    incidentStatus: UpdateIncidentStatusDto,
    logginedUserId: string,
  ): Promise<IIncident> {
    await this.incident.update({ ...incidentStatus, updatedBy: logginedUserId }, { where: { customerAccountKey, incidentId } });

    return this.getIncidentById(customerAccountKey, incidentId);
  }

  /**
   * Create an action for an incident
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @param  {CreateIncidentActionDto} actionData
   * @param  {string} logginedUserId
   * @returns Promise<IIncidentAction>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async createIncidentAction(
    customerAccountKey: number,
    incidentId: string,
    actionData: CreateIncidentActionDto,
    logginedUserId: string,
  ): Promise<IIncidentAction> {
    if (isEmpty(actionData)) throw new HttpException(400, 'Incident must not be empty');

    const tableIdTableName = 'IncidentAction';
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    if (!tableId) {
      return;
    }

    const { incidentKey } = await this.getIncidentKey(customerAccountKey, incidentId);

    try {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createdActionData: IIncidentAction = await this.incidentAction.create({
        ...actionData,
        createdBy: logginedUserId,
        incidentKey,
        incidentActionId: responseTableIdData.tableIdFinalIssued,
      });

      return createdActionData;
    } catch (error) {}
  }

  /**
   * Get all the actions in an incident
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @returns Promise<IIncidentAction[]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentActionsByIncidentId(customerAccountKey: number, incidentId: string): Promise<IIncidentAction[]> {
    const { incidentKey } = await this.getIncidentKey(customerAccountKey, incidentId);

    const incidentActions: IIncidentAction[] = await this.incidentAction.findAll({
      where: { incidentKey, deletedAt: null },
      attributes: { exclude: ['incidentKey', 'incidentActionKey', 'deletedAt'] },
    });

    return incidentActions;
  }
  /**
   * Get an incidentAction by incidentActionId
   *
   * @param  {string} actionId
   * @returns Promise<IIncidentAction>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentActionByActionId(actionId: string): Promise<IIncidentAction> {
    const incidentAction: IIncidentAction = await this.incidentAction.findOne({
      where: { incidentActionId: actionId, deletedAt: null },
      attributes: { exclude: ['incidentKey', 'incidentActionKey', 'deletedAt'] },
    });

    return incidentAction;
  }

  /**
   * Get an incidentActionKey
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @param  {string} actionId
   * @returns Promise<IIncidentAction>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async getIncidentActionKey(customerAccountKey: number, incidentId: string, actionId: string): Promise<IIncidentAction> {
    const { incidentKey } = await this.getIncidentKey(customerAccountKey, incidentId);

    const incidentAction: IIncidentAction = await this.incidentAction.findOne({
      where: { incidentKey, deletedAt: null, incidentActionId: actionId },
      attributes: ['incidentActionKey'],
    });

    return incidentAction;
  }

  /**
   * Update an anction within incident
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @param  {string} actionId
   * @param  {CreateIncidentActionDto} actionData
   * @param  {string} logginedUserId
   * @returns Promise<IIncidentAction>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncidentAction(
    customerAccountKey: number,
    incidentId: string,
    actionId: string,
    actionData: CreateIncidentActionDto,
    logginedUserId: string,
  ): Promise<IIncidentAction> {
    if (isEmpty(actionData)) throw new HttpException(400, 'Incident must not be empty');

    const incidentAction: IIncidentAction = await this.incidentAction.findOne({ where: { incidentActionId: actionId } });

    if (!incidentAction) {
      return null;
    }

    try {
      const { incidentKey } = await this.getIncidentKey(customerAccountKey, incidentId);

      await this.incidentAction.update(
        {
          ...actionData,
          updatedBy: logginedUserId,
        },
        { where: { incidentActionId: actionId, incidentKey } },
      );

      const updatedResult: IIncidentAction = await this.incidentAction.findOne({
        where: { incidentActionId: actionId, incidentKey },
        attributes: { exclude: ['incidentActionKey', 'incidentKey', 'deletedAt'] },
      });

      return updatedResult;
    } catch (error) {}
  }

  /**
   * Delete an action from incident
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @param  {string} actionId
   * @param  {string} logginedUserId
   * @returns Promise<[number, IncidentActionModel[]]>
   * @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async deleteIncidentActionById(
    customerAccountKey: number,
    incidentId: string,
    actionId: string,
    logginedUserId: string,
  ): Promise<[number, IncidentActionModel[]]> {
    const incidentAction: IIncidentAction = await this.incidentAction.findOne({ where: { incidentActionId: actionId } });

    if (!incidentAction) {
      return null;
    }

    try {
      const { incidentKey } = await this.getIncidentKey(customerAccountKey, incidentId);

      const deletedIncidentAction: [number, IncidentActionModel[]] = await this.incidentAction.update(
        { deletedAt: new Date(), updatedBy: logginedUserId },
        { where: { incidentActionId: actionId, incidentKey } },
      );

      return deletedIncidentAction;
    } catch (error) {}
  }

  public async createIncidentActionAttachment(
    customerAccountKey: number,
    incidentId: string,
    actionId: string,
    actionAttachmentData: CreateIncidentActionAttachmentDto,
    logginedUserId: string,
  ): Promise<IIncidentActionAttachment> {
    if (isEmpty(actionAttachmentData)) throw new HttpException(400, 'Incident must not be empty');

    const tableIdTableName = 'IncidentActionAttachment';
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    if (!tableId) {
      return;
    }

    const { incidentActionKey = undefined } = await this.getIncidentActionKey(customerAccountKey, incidentId, actionId);

    if (!incidentActionKey) {
      return null;
    }

    try {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createdActionAttachment: IIncidentActionAttachment = await this.incidentActionAttachment.create({
        ...actionAttachmentData,
        createdBy: logginedUserId,
        incidentActionKey,
        incidentActionAttachmentId: responseTableIdData.tableIdFinalIssued,
      });

      return createdActionAttachment;
    } catch (error) {}
  }

  public async getIncidentActionAttachment(customerAccountKey: number, incidentId: string, actionId: string): Promise<IIncidentActionAttachment[]> {
    const { incidentActionKey = undefined } = await this.getIncidentActionKey(customerAccountKey, incidentId, actionId);

    if (!incidentActionKey) {
      return null;
    }

    try {
      const incidentActionAttachments: IIncidentActionAttachment[] = await this.incidentActionAttachment.findAll({
        where: {
          incidentActionKey,
          deletedAt: null,
        },
      });

      return incidentActionAttachments;
    } catch (error) {}
  }

  /**
   * update an incident action attachment
   *
   * @param  {number} customerAccountKey
   * @param  {string} incidentId
   * @param  {string} actionId
   * @param  {string} attachmentId
   * @param  {CreateIncidentActionAttachmentDto} actionAttachmentData
   * @param  {string} logginedUserId
   * @returns Promise<IIncidentActionAttachmentResponse>
   *  @author Saemsol Yoo <yoosaemsol@nexclipper.io>
   */
  public async updateIncidentActionAttachment(
    customerAccountKey: number,
    incidentId: string,
    actionId: string,
    attachmentId: string,
    actionAttachmentData: CreateIncidentActionAttachmentDto,
    logginedUserId: string,
  ): Promise<IIncidentActionAttachmentResponse> {
    if (isEmpty(actionAttachmentData)) throw new HttpException(400, 'Incident must not be empty');

    const { incidentActionKey = undefined } = await this.getIncidentActionKey(customerAccountKey, incidentId, actionId);

    if (!incidentActionKey) {
      return null;
    }

    try {
      const updatedActionAttachment: [number, IncidentActionAttachmentModel[]] = await this.incidentActionAttachment.update(
        {
          ...actionAttachmentData,
          updatedBy: logginedUserId,
        },
        {
          where: {
            incidentActionAttachmentId: attachmentId,
          },
        },
      );

      if (!!updatedActionAttachment[0]) {
        return {
          incidentActionAttachmentId: actionId,
          updatedBy: logginedUserId,
          updatedAt: new Date(),
          ...actionAttachmentData,
        };
      } else {
        return null;
      }
    } catch (error) {}
  }

  public async addAlertReceivedtoIncident(
    customerAccountKey: number,
    incidentId: string,
    addAlertReceivedData: AddAlertReceivedToIncidentDto,
    logginedUserId: string,
  ): Promise<any> {
    if (isEmpty(addAlertReceivedData)) throw new HttpException(400, 'AlertReceivedIds not be empty');

    const tableIdTableName = 'IncidentAlertReceived';
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    if (!tableId) {
      return;
    }

    try {
      const { incidentKey = undefined } = await this.getIncidentKey(customerAccountKey, incidentId);

      const { alertReceivedIds } = addAlertReceivedData;

      const alertReceivedDetails = await this.alertReceived.findAll({
        where: { alertReceivedId: { [Op.in]: alertReceivedIds } },
        attributes: ['alertReceivedKey'],
      });

      if (!alertReceivedDetails.length) {
        return 'alertReceivedId error';
      }

      const alertReceivedKeyList = alertReceivedDetails.map(alertReceived => alertReceived.alertReceivedKey);

      let insertDataList = [];

      for (const alertReceivedKey of alertReceivedKeyList) {
        const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

        insertDataList.push({
          incidentAlertReceivedId: responseTableIdData.tableIdFinalIssued,
          incidentKey,
          alertReceivedKey,
          createdBy: logginedUserId,
        });
      }

      return await this.incidentAlertReceived.bulkCreate(insertDataList, { returning: true });
    } catch (error) {}
  }

  public async dropAlertReceivedfromIncident(
    customerAccountKey: number,
    incidentId: string,
    dropAlertReceivedData: DropAlertReceivedFromIncidentDto,
    logginedUserId: string,
  ): Promise<any> {
    const { incidentKey = undefined } = await this.getIncidentKey(customerAccountKey, incidentId);

    const { alertReceivedIds } = dropAlertReceivedData;

    const alertReceivedDetails = await this.alertReceived.findAll({
      where: { alertReceivedId: { [Op.in]: alertReceivedIds } },
      attributes: ['alertReceivedKey'],
    });

    if (!alertReceivedDetails.length) {
      return 'alertReceivedId error';
    }

    const alertReceivedKeyList = alertReceivedDetails.map(alertReceived => alertReceived.alertReceivedKey);

    await this.incidentAlertReceived.update(
      { deletedAt: new Date(), updatedBy: logginedUserId },
      {
        where: {
          incidentKey,
          alertReceivedKey: { [Op.in]: alertReceivedKeyList },
        },
      },
    );
  }
}

export default IncidentService;
