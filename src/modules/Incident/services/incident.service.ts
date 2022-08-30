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

import { IIncidentAlertReceived } from '@/common/interfaces/incidentAlertReceived.interface';
import { IIncidentCounts } from '@/common/interfaces/incidentCounts.interface';
import sequelize from 'sequelize';
import { Op } from 'sequelize';
import { PartyModel } from '@/modules/Party/models/party.model';
import PartyService from '@/modules/Party/services/party.service';
import UploadService from '@/modules/CommonService/services/fileUpload.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { PartyUserModel } from '@/modules/Party/models/partyUser.model';
import { CreateIncidentActionAttachmentDto } from '../dtos/incidentActionAttachment.dto';
import { AlertReceivedModel } from '@/modules/Alert/models/alertReceived.model';

/**
 * @memberof Incident
 */
class IncidentService {
  public incident = DB.Incident;
  public incidentAlertReceived = DB.IncidentAlertReceived;
  public incidentAction = DB.IncidentAction;
  public incidentActionAttachment = DB.IncidentActionAttachment;
  public alertReceived = DB.AlertReceived;

  public partyService = new PartyService();
  public tableIdService = new TableIdService();
  public fileUploadService = new UploadService();

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

    try {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      if (incidentData.assigneeId) {
        const assignee = await this.partyService.getUserKey(customerAccountKey, incidentData.assigneeId);

        const createIncidentData: any = await this.incident.create({
          ...incidentData,
          assigneeKey: assignee.partyKey,
          customerAccountKey,
          createdBy: logginedUserId,
          incidentId: responseTableIdData.tableIdFinalIssued,
        });

        return createIncidentData;
      } else {
        const createIncidentData: any = await this.incident.create({
          ...incidentData,
          customerAccountKey,
          createdBy: logginedUserId,
          incidentId: responseTableIdData.tableIdFinalIssued,
        });

        return createIncidentData;
      }
    } catch (error) {
      throw error;
    }
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
        {
          as: 'createdByDetail',
          model: PartyUserModel,
          attributes: ['partyUserId', 'firstName', 'lastName', 'userId', 'mobile', 'email', 'lastAccessAt'],
          association: DB.PartyUser.belongsTo(DB.PartyUser, { foreignKey: 'createdBy', targetKey: 'partyUserId' }),
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
    } catch (error) {
      throw error;
    }
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
  public async deleteIncidentById(customerAccountKey: number, incidentId: string, logginedUserId: string): Promise<[number]> {
    try {
      return await DB.sequelize.transaction(async t => {
        const deletedIncident: [number] = await this.incident.update(
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
      where: { deletedAt: null, incidentStatus: '0O', customerAccountKey },
    });
    const inprogressAmount = await this.incident.count({
      where: { deletedAt: null, incidentStatus: '1I', customerAccountKey },
    });
    const resolvedAmount = await this.incident.count({
      where: { deletedAt: null, incidentStatus: '2R', customerAccountKey },
    });
    const closedAmount = await this.incident.count({
      where: { deletedAt: null, incidentStatus: '3C', customerAccountKey },
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

  public async getIncidentActionKeysByIncidentId(incidentKey: number): Promise<IIncidentAction[]> {
    const incidentActionKeys: IIncidentAction[] = await this.incidentAction.findAll({
      where: { incidentKey: incidentKey, deletedAt: null },
    });
    return incidentActionKeys;
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
  public async deleteIncidentActionById(customerAccountKey: number, incidentId: string, actionId: string, logginedUserId: string): Promise<[number]> {
    const incidentAction: IIncidentAction = await this.incidentAction.findOne({ where: { incidentActionId: actionId } });

    if (!incidentAction) {
      return null;
    }

    try {
      const { incidentKey } = await this.getIncidentKey(customerAccountKey, incidentId);

      const deletedIncidentAction: [number] = await this.incidentAction.update(
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
    incidentActionAttachmentFile: any,
  ): Promise<IIncidentActionAttachment> {
    if (isEmpty(actionAttachmentData)) throw new HttpException(400, 'Incident must not be empty');

    const tableIdTableName = 'IncidentActionAttachment';
    const moduleName = 'INC';

    const { incidentActionKey } = await this.getIncidentActionKey(customerAccountKey, incidentId, actionId);

    try {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const fileName = moduleName + customerAccountKey + '-' + logginedUserId + '-' + responseTableIdData.tableIdFinalIssued;

      const uploadedFilePath = await this.fileUploadService.uploadService(
        fileName,
        actionAttachmentData.incidentActionAttachmentFileType,
        incidentActionAttachmentFile,
      );
      if (uploadedFilePath.status === 'ok') {
        const createdActionAttachment: IIncidentActionAttachment = await this.incidentActionAttachment.create({
          ...actionAttachmentData,
          createdBy: logginedUserId,
          incidentActionKey,
          incidentActionAttachmentId: responseTableIdData.tableIdFinalIssued,
          incidentActionAttachmentPath: uploadedFilePath.data.Key,
        });
        return createdActionAttachment;
      } else {
        throw new HttpException(500, uploadedFilePath.data);
      }
    } catch (error) {
      throw new HttpException(400, 'Not able to attach this attachment.');
    }
  }

  public async getAttachmentById(customerAccountKey: number, attachmentId: string): Promise<IIncidentActionAttachment> {
    const attachment: IIncidentActionAttachment = await this.incidentActionAttachment.findOne({
      where: { deletedAt: null, incidentActionAttachmentId: attachmentId },
      attributes: { exclude: ['incidentKey', 'customerAccountKey', 'assigneeKey', 'deletedAt', 'incidentActionKey'] },
    });
    const downloadLink = this.fileUploadService.uploadedFileLink(attachment.incidentActionAttachmentPath);
    attachment.incidentActionAttachmentPath = String(downloadLink);
    return attachment;
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

  public async deleteIncidentActionAttachment(customerAccountKey: number, attachmentId: string, logginedUserId: string): Promise<[number]> {
    try {
      const deletedIncidentActionAttachments: [number] = await this.incidentActionAttachment.update(
        { deletedAt: new Date(), updatedBy: logginedUserId },
        { where: { incidentActionAttachmentId: attachmentId } },
      );
      const deletedAttachment: IIncidentActionAttachment = await this.incidentActionAttachment.findOne({
        where: { incidentActionAttachmentId: attachmentId },
      });
      if (deletedAttachment) {
        const uploadedFilePath = await this.fileUploadService.delete({ query: { fileName: deletedAttachment.incidentActionAttachmentPath } });
      }

      return deletedIncidentActionAttachments;
    } catch (error) {}
  }

  public async getIncidentAttachmentByIncidentId(customerAccountKey: number, incidentId: string): Promise<IIncidentActionAttachment[]> {
    const { incidentKey } = await this.getIncidentKey(customerAccountKey, incidentId);
    const incidentActionKeys = await this.getIncidentActionKeysByIncidentId(incidentKey);
    const incidentActionKeysList = incidentActionKeys.map(incidentActionKeysX => incidentActionKeysX.incidentActionKey);
    const incidentActionAttachments: IIncidentActionAttachment[] = await this.incidentActionAttachment.findAll({
      where: { deletedAt: null, incidentActionKey: { [Op.in]: incidentActionKeysList } },
    });

    return incidentActionAttachments;
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
  ): Promise<any> {
    // TODO: originally Promise<IIncidentActionAttachmentResponse>
    // Has to make it any, because of the following error:
    // Property 'incidentActionAttachmentPath' is missing in type '{ incidentActionAttachmentName: string; incidentActionAttachmentDescription: string; incidentActionAttachmentType: "PD" | "JS" | "IM" | "MO"; incidentActionAttachmentFilename: string; incidentActionAttachmentFileType: string; incidentActionAttachmentId: string; updatedBy: string; updatedAt: Date; }' but required in type 'IIncidentActionAttachmentResponse'.
    if (isEmpty(actionAttachmentData)) throw new HttpException(400, 'Incident must not be empty');

    try {
      const updatedActionAttachment: [number] = await this.incidentActionAttachment.update(
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

  public async getAlertByIncidentKey(customerAccountKey: number, incidentKey: number): Promise<any> {
    try {
      /* sequelize join doesn't work with ResourceGroup.... Sequelize bug. can't use "include" bugfix/149
      const foundIncidentWithAlerts: any = await this.incident.findOne({
        where: {
          incidentKey,
        },
        include: [
          {
            model: this.alertReceived,
            required: false,
            as: 'alertReceived',
          },
        ],
      });

      if (!foundIncidentWithAlerts) {
        throw new HttpException(400, 'Incident not found');
      }

      return foundIncidentWithAlerts?.alertReceived;
    */
      const sql=`SELECT 
                  A.alert_received_id as alertReceivedId, 
                  A.alert_received_state as alertReceivedState,
                  A.alert_received_value as alertReceivedValue,
                  A.alert_received_name as alertReceivedName,
                  A.alert_received_severity as alertReceivedSeverity,
                  A.alert_received_active_at as alertReceivedActiveAt,
                  A.alert_received_summary alertReceivedSummary,
                  A.alert_received_description alertReceivedDescription,
                  A.created_at as createdAt,
                  A.updated_at as updatedAt,
                  B.alert_rule_id as alertRuleId,
                  B.alert_rule_name as alertRuleName,
                  C.resource_group_id as resourceGroupId,
                  C.resource_group_uuid as resourceGroupUuid,
                  C.resource_group_name as resourceGroupName
                FROM AlertReceived A, AlertRule B, ResourceGroup C, IncidentAlertReceived D
                WHERE D.incident_key = ${incidentKey}
                  and A.alert_rule_key = B.alert_rule_key
                  and B.resource_group_uuid = C.resource_group_uuid
                  and A.deleted_at is null 
                  and B.deleted_at is null 
                  and C.deleted_at is null
                  and D.deleted_at is null
                  and A.alert_received_key = D.alert_received_key`
        ; 
    
      const [result, metadata] = await DB.sequelize.query(sql); 
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async addAlertReceivedtoIncident(
    customerAccountKey: number,
    incidentId: string,
    addAlertReceivedData: AddAlertReceivedToIncidentDto,
    logginedUserId: string,
  ): Promise<any> {
    if (isEmpty(addAlertReceivedData)) throw new HttpException(400, 'AlertReceivedIds not be empty');

    const tableIdTableName = 'IncidentAlertReceived';

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

      const insertDataList = [];

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
    } catch (error) {
      throw error;
    }
  }

  public async dropAlertReceivedfromIncident(
    customerAccountKey: number,
    incidentId: string,
    dropAlertReceivedData: DropAlertReceivedFromIncidentDto,
    logginedUserId: string,
  ): Promise<any> {
    try {
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
        //@ts-expect-error
        { deletedBy: logginedUserId },
        {
          where: {
            incidentKey,
            alertReceivedKey: { [Op.in]: alertReceivedKeyList },
          },
        },
      );
      const result = await this.incidentAlertReceived.destroy({
        where: {
          incidentKey,
          alertReceivedKey: { [Op.in]: alertReceivedKeyList },
        },
      });

      return result > 0 ? 'deleted' : false;
    } catch (error) {
      throw error;
    }
  }
}

export default IncidentService;
