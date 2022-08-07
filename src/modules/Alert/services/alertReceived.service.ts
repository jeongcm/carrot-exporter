import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertReceived, IAlertReceivedDetailed } from '@/common/interfaces/alertReceived.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { AlertReceivedDto } from '../dtos/alertReceived.dto';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import AlertRuleService from './alertRule.service';
import { AlertRuleModel } from '@/modules/Alert/models/alertRule.model';
import ServiceExtension from '@/common/extentions/service.extension';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';

const { Op } = require('sequelize');

const ALERT_STATUS = {
  firing: 'firing',
  pending: 'pending',
  resolved: 'resolved',
};

class AlertReceivedService extends ServiceExtension {
  private alertRule = DB.AlertRule;
  public alertReceived = DB.AlertReceived;
  public alertRuleService = new AlertRuleService();
  private resourceGroup = DB.ResourceGroup;

  constructor() {
    super({
      tableName: 'AlertReceived',
    });
  }

  public async getAllAlertReceived(customerAccountKey: number): Promise<IAlertReceived[]> {
    const allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['alertReceivedKey', 'deletedAt', 'updatedBy', 'createdBy'] },
      // include: [
      //   {
      //     model: this.alertRule,
      //     as: 'alertRule',
      //     include: [
      //       {
      //         model: this.resourceGroup,
      //       },
      //     ],
      //   },
      // ],
    });
    return allAlertReceived;
  }

  private getWhereClauseFrom(query: any[], op: 'AND' | 'OR') {
    let where = '';
    query.forEach((value: any) => {
      let symbol = '';
      switch ((value.op || '').toUpperCase()) {
        case 'EQ':
          symbol = '=';
          break;
        default:
      }

      switch (value.name) {
        case 'alertReceivedState':
          where = ` ${op} alert_received_state ${symbol} "${ALERT_STATUS[value.value]}"`;
          break;
        case 'alertReceivedNode':
          where = ` ${op} alert_received_node ${symbol} "${value.value}"`;
          break;
        case 'alertReceivedPod':
          where = ` ${op} alert_received_pod ${symbol} "${value.value}"`;
          break;
        case 'alertReceivedService':
          where = ` ${op} alert_received_service ${symbol} "${value.value}"`;
          break;
        case 'persistentVolumeClaim':
          where = ` ${op} JSON_CONTAINS(alert_received_labels, '"${value.value}"', '$.persistentvolumeclaim')`;
          break;
      }
    });

    console.log(where);

    return where;
  }

  public async getAllAlertReceivedByAlertRuleId(customerAccountKey: number, alertRuleId?: string): Promise<any[]> {
    if (isEmpty(alertRuleId)) throw new HttpException(400, 'Not a valid AlertRuleId');
    const currentAlertRule: IAlertRule = await this.alertRule.findOne({
      where: { alertRuleId, deletedAt: null },
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    const currentAlertRuleKey = currentAlertRule.alertRuleKey;
    if (!currentAlertRule) throw new HttpException(404, 'AlertRuleId is not found');
    const allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null, alertRuleKey: currentAlertRuleKey },
      order: [['alertReceivedActiveAt', 'DESC']],
    });
    return allAlertReceived;

    return null;
  }

  public async getAllAlertReceivedByAlertHash(alertHash?: string): Promise<any[]> {
    if (isEmpty(alertHash)) throw new HttpException(400, 'Not a valid AlertReceivedHash');
    const allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { deletedAt: null, alertReceivedHash: alertHash },
      order: [['alertReceivedActiveAt', 'DESC']],
    });
    return allAlertReceived;
  }

  public async getAllAlertReceivedMostRecent(customerAccountKey: number, query?: any[]): Promise<IAlertReceived[]> {
    if (query && !Array.isArray(query)) {
      this.throwError('EXCEPTION', 'incorrect query format');
    }
    const extraQuery = this.getWhereClauseFrom(query, 'AND');

    if (query.length > 0 && !extraQuery) {
      return [];
    }

    const [results] = await DB.sequelize.query(`WITH recent_alerts AS (
        SELECT m.*, ROW_NUMBER() OVER (PARTITION BY alert_received_name, alert_rule_key, alert_received_state ORDER BY created_at ASC) AS rn
        FROM AlertReceived AS m
        WHERE customer_account_key = "${customerAccountKey}" AND deleted_at IS NULL${extraQuery}
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

    if (results) {
      return results as IAlertReceived[];
    }

    return [];
  }

  public async findAlertReceivedById(alertReceivedId: string): Promise<IAlertReceived> {
    if (isEmpty(alertReceivedId)) throw new HttpException(400, 'Not a valid Alert Received Id');

    const findAlertReceived: IAlertReceived = await this.alertReceived.findOne({
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

    if (!findAlertReceived) throw new HttpException(404, 'Alert Received Not found');

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
      } else {
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
    }

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
    const tempAlertReceivedId: string = await this.createTableId();

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
