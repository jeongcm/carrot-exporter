import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertReceived, IAlertReceivedDetailed } from '@/common/interfaces/alertReceived.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { AlertReceivedDto } from '../dtos/alertReceived.dto';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import AlertRuleService from './alertRule.service';
import { AlertRuleModel } from '@/modules/Alert/models/alertRule.model';

const { Op } = require('sequelize');

class AlertReceivedService {
  public tableIdService = new TableIdService();
  public alertRule = DB.AlertRule;
  public alertReceived = DB.AlertReceived;
  public alertRuleService = new AlertRuleService();

  public async getAllAlertReceived(customerAccountKey: number): Promise<IAlertReceived[]> {
    const allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['alertReceivedKey', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allAlertReceived;
  }

  public async getAllAlertReceivedMostRecent(customerAccountKey: number): Promise<IAlertReceivedWithRule[]> {
    const [results] = await DB.sequelize.query(`WITH recent_alerts AS (
        SELECT m.*, ROW_NUMBER() OVER (PARTITION BY alert_received_name ORDER BY created_at ASC) AS rn
        FROM AlertReceived AS m
        WHERE customer_account_key = "${customerAccountKey}"
      )
      SELECT
        recent_alerts.alert_received_id as alertReceivedId,
        recent_alerts.created_at as createdAt,
        recent_alerts.updated_at as updatedAt,
        recent_alerts.alert_received_name as alertReceivedName,
        recent_alerts.alert_received_value as alertReceivedValue,
        recent_alerts.alert_received_state as alertReceivedState,
        recent_alerts.alert_received_namespace as alertReceivedNamespace,
        recent_alerts.alert_received_severity as alertReceivedSeverity,
        recent_alerts.alert_received_description as alertReceivedDescription,
        recent_alerts.alert_received_summary as alertReceivedSummary,
        recent_alerts.alert_received_active_at as alertReceivedActive,
        recent_alerts.alert_received_node as alertReceivedNode,
        recent_alerts.alert_received_service as alertReceivedService,
        recent_alerts.alert_received_pod as alertReceivedPod,
        recent_alerts.alert_received_instance as alertReceivedInstance,
        recent_alerts.alert_received_labels as alertReceivedLabels,
        recent_alerts.alert_received_pinned as alertReceivedPinned,
        JSON_OBJECT(
          'alertRuleId', AlertRule.alert_rule_id
        ) AS alertRule,
        JSON_OBJECT(
          'resourceGroupUuid', ResourceGroup.resource_group_uuid,
          'resourceGroupId', ResourceGroup.resource_group_id,
          'resourceGroupName', ResourceGroup.resource_group_name
        ) AS resourceGroup
      FROM recent_alerts
      INNER JOIN AlertRule ON recent_alerts.alert_rule_key = AlertRule.alert_rule_key
      INNER JOIN ResourceGroup ON AlertRule.resource_group_uuid = ResourceGroup.resource_group_uuid
      WHERE rn = 1;
    `);

    return results;
  }

  public async findAlertReceivedById(alertReceivedId: string): Promise<IAlertReceivedDetailed> {
    if (isEmpty(alertReceivedId)) throw new HttpException(400, 'Not a valid Alert Received Id');

    const findAlertReceived: IAlertReceivedDetailed = await this.alertReceived.findOne({
      where: { alertReceivedId, deletedAt: null },
      attributes: { exclude: ['customerAccountKey', 'alertRuleKey', 'alertReceivedKey', 'deletedAt', 'updatedBy', 'createdBy'] },
      include: [
        {
          model: AlertRuleModel,
          as: 'alertRule',
          attributes: { exclude: ['alertRuleKey', 'customerAccountKey', 'deletedAt', 'updatedBy', 'createdBy'] },
        },
      ],
    });
    if (!findAlertReceived) throw new HttpException(404, 'Alert Received Id Not found');

    return findAlertReceived;
  }

  public async deleteAlertReceived(customerAccountKey: number, alertReceivedId: string) {
    try {
      const deleteAlertReceivedData = {
        deletedAt: new Date(),
      };

      const result = await this.alertReceived.update(deleteAlertReceivedData, {
        where: {
          customerAccountKey: customerAccountKey,
          alertReceivedId: alertReceivedId,
          deletedAt: {
            [Op.eq]: null,
          },
        },
      });
      if (result[0] == 1) {
        return true;
      }else{
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  public async getAlertReceivedHistory(customerAccountKey: number, alertReceivedId: string): Promise<IAlertReceived[]> {
    const alertFound: IAlertReceived = await this.alertReceived.findOne({
      where: { customerAccountKey: customerAccountKey, alertReceivedId: alertReceivedId, deletedAt: null },
    });

    if (!alertFound) {
      throw new HttpException(404, 'ALERT_NOT_FOUND');
    };

    // TODO: to add more criteria to identify a group of alerts
    const query = { alertReceivedName: alertFound.alertReceivedName };

    const allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null, ...query },
      attributes: { exclude: ['alertReceivedKey', 'alertRuleKey', 'customerAccountKey', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allAlertReceived;
  }

  public async updateAlertReceived(
    alertReceivedId: string,
    alertReceivedData: CreateAlertRuleDto,
    customerAccountKey: number,
    partyId: string,
  ): Promise<IAlertReceived> {
    if (isEmpty(alertReceivedData)) throw new HttpException(400, 'AlertReceived Data cannot be blank');
    const findAlertReceived: IAlertReceived = await this.alertReceived.findOne({ where: { alertReceivedId } });
    if (!findAlertReceived) throw new HttpException(409, "Alert Received doesn't exist");
    const updateAlertReceivedData = {
      ...alertReceivedData,
      customerAccountKey: customerAccountKey,
      updatedBy: partyId,
      updatedAt: new Date(),
    };
    await this.alertReceived.update(updateAlertReceivedData, { where: { alertReceivedId: alertReceivedId } });

    return await this.findAlertReceivedById(alertReceivedId);
  }

  public async createAlertReceived(alertReceivedData: AlertReceivedDto, customerAccountKey: number, partyId: string): Promise<IAlertReceived> {
    if (isEmpty(alertReceivedData)) throw new HttpException(400, 'Create AlertReceived cannot be blank');
    const tableIdName: string = 'AlertReceived';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempAlertReceivedId: string = responseTableIdData.tableIdFinalIssued;

    // get alertRuleKey using customerAccountKey
    const alertRuleKey: number = await this.alertRuleService.getAlertRuleKey(customerAccountKey);

    const currentDate = new Date();
    const newAlertReceived = {
      ...alertReceivedData,
      customerAccountKey: customerAccountKey,
      alertReceivedId: tempAlertReceivedId,
      alertReceivedActiveAt: currentDate,
      createdAt: currentDate,
      createdBy: partyId,
      alertRuleKey,
    };
    const createAlertReceivedData: IAlertReceived = await this.alertReceived.create(newAlertReceived);
    return createAlertReceivedData;
  }
}

export default AlertReceivedService;

/*
      SELECT
        recent_alerts.alert_received_id as alertReceivedId,
        recent_alerts.created_at as createdAt,
        recent_alerts.updated_at as updatedAt,
        recent_alerts.alert_received_name as alertReceivedName,
        recent_alerts.alert_received_value as alertReceivedValue,
        recent_alerts.alert_received_state as alertReceivedState,
        recent_alerts.alert_received_namespace as alertReceivedNamespace,
        recent_alerts.alert_received_severity as alertReceivedSeverity,
        recent_alerts.alert_received_description as alertReceivedDescription,
        recent_alerts.alert_received_summary as alertReceivedSummary,
        recent_alerts.alert_received_active_at as alertReceivedActive,
        recent_alerts.alert_received_node as alertReceivedNode,
        recent_alerts.alert_received_service as alertReceivedService,
        recent_alerts.alert_received_pod as alertReceivedPod,
        recent_alerts.alert_received_instance as alertReceivedInstance,
        recent_alerts.alert_received_labels as alertReceivedLabels,
        recent_alerts.alert_received_pinned as alertReceivedPinned,
        AlertRule.resource_group_uuid as 'alertRule.resourceGroupUuid',
        AlertRule.alert_rule_id as 'alertRule.alertRuleId'
*/
