import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertReceived, IAlertReceivedDetailed } from '@/common/interfaces/alertReceived.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { AlertReceivedDto } from '../dtos/alertReceived.dto';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import AlertRuleService from './alertRule.service';
import { AlertRuleModel } from '@/modules/Alert/models/alertRule.model';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
import ServiceExtension from '@/common/extentions/service.extension';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import sequelize from 'sequelize';

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
  private resource = DB.Resource;
  private customerAccount = DB.CustomerAccount;

  constructor() {
    super({
      tableName: 'AlertReceived',
    });
  }

  public async getAllAlertReceived(customerAccountKey: number): Promise<object> {
    /* sequelize join doesn't work with ResourceGroup.... Sequelize bug. can't use "include" bugfix/149
    const allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['alertReceivedKey', 'deletedAt', 'updatedBy', 'createdBy'] },
       include: [
         {
           model: AlertRuleModel,
           as: 'alertRule',
           required: true,
           where: { deletedAt: null},
           include: [
           {
               model: ResourceGroupModel,
               required: true,
               //where: {deletedAt: null},
             },
           ],
         },
       ],
    });
    */
    const sql = `SELECT
                A.customer_account_key as customerAccountKey,
                A.alert_received_id as alertReceivedId,
                A.alert_received_state as alertReceivedState,
                A.alert_received_value as alertReceivedValue,
                A.alert_received_name as alertReceivedName,
                A.alert_received_severity as alertReceivedSeverity,
                A.alert_received_active_at as alertReceivedActiveAt,
                A.alert_received_summary alertReceivedSummary,
                A.alert_received_description alertReceivedDescription,
                A.alert_received_affected_resource_type alertReceivedAffectedResourceType,
                A.alert_received_affected_resource_name alertReceivedAffectedResourceName,
                A.created_at as createdAt,
                A.updated_at as updatedAt,
                B.alert_rule_id as alertRuleId,
                B.alert_rule_name as alertRuleName,
                C.resource_group_id as resourceGroupId,
                C.resource_group_uuid as resourceGroupUuid,
                C.resource_group_name as resourceGroupName
              FROM AlertReceived A, AlertRule B, ResourceGroup C
              WHERE A.customer_account_key = ${customerAccountKey}
                and A.alert_rule_key = B.alert_rule_key
                and B.resource_group_uuid = C.resource_group_uuid
                and A.deleted_at is null
                and B.deleted_at is null
                and C.deleted_at is null`;
    const [result, metadata] = await DB.sequelize.query(sql);
    //return allAlertReceived;
    return result;
  }

  public async getAllAlertReceivedByParentCustomerAccountId(ParentCustomerAccountId: string): Promise<object> {
    /* sequelize join doesn't work with ResourceGroup.... Sequelize bug. can't use "include" bugfix/149
    const allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['alertReceivedKey', 'deletedAt', 'updatedBy', 'createdBy'] },
       include: [
         {
           model: AlertRuleModel,
           as: 'alertRule',
           required: true,
           where: { deletedAt: null},
           include: [
           {
               model: ResourceGroupModel,
               required: true,
               //where: {deletedAt: null},
             },
           ],
         },
       ],
    });
    */

    // first. get customerAccountKeys by Parent CustomerAccountId
    // second, get alertRecevied by customerAccountKeys,
    // third, get resource type by alertReceived.AlertRecivedNode or Pod, if Pod is exist, resource_type is POD
    // but if node only exist, resource Type is NODE
    let customerAccounts = await this.customerAccount.findAll({
      where: {deletedAt: null, parentCustomerAccountId: ParentCustomerAccountId}
    })

    var customerAccountKeys = customerAccounts.map(ca => {
      return ca.customerAccountKey
    })

    const sql = `SELECT
                A.customer_account_key as customerAccountKey,
                A.alert_received_id as alertReceivedId,
                A.alert_received_state as alertReceivedState,
                A.alert_received_value as alertReceivedValue,
                A.alert_received_name as alertReceivedName,
                A.alert_received_severity as alertReceivedSeverity,
                A.alert_received_active_at as alertReceivedActiveAt,
                A.alert_received_summary as alertReceivedSummary,
                A.alert_received_description as alertReceivedDescription,
                A.alert_received_affected_resource_type as alertReceivedAffectedResourceType,
                A.alert_received_affected_resource_name as alertReceivedAffectedResourceName,
                A.alert_received_node as alertReceivedNode,
                A.alert_received_pod as alertReceivedPod,
                A.created_at as createdAt,
                A.updated_at as updatedAt,
                B.alert_rule_id as alertRuleId,
                B.alert_rule_name as alertRuleName,
                C.resource_group_id as resourceGroupId,
                C.resource_group_uuid as resourceGroupUuid,
                C.resource_group_name as resourceGroupName
              FROM AlertReceived A, AlertRule B, ResourceGroup C
              WHERE A.customer_account_key in (${customerAccountKeys})
                and A.alert_rule_key = B.alert_rule_key
                and A.alert_rule_key = B.alert_rule_key
                and B.resource_group_uuid = C.resource_group_uuid
                and A.deleted_at is null
                and B.deleted_at is null
                and C.deleted_at is null
                and (A.alert_received_pod != ""
                or A.alert_received_node != "")
                order by A.created_at desc`;

    let result: any
    let metadata: any
    [result, metadata] = await DB.sequelize.query(sql);
    let resource: any

    for (let alert of result) {
      if (alert.alertReceivedNode === "" && alert.alertReceivedPod === "") {
        continue
      }

      let name: string
      let type: string
      type = "ND"
      name = alert?.alertReceivedNode
      if (alert.alertReceivedPod !== "") {
        type = "PD"
        name = alert.alertReceivedPod
      }

      resource = await this.resource.findOne({
        where: { resourceName: name },
        attributes: ['resourceType', 'resourceName']
      })

      if (resource !== null) {
        alert.resourceType = resource?.resourceType
        alert.resourceName = resource?.resourceName
      } else {
        alert.resourceType = type
        alert.resourceName = name
      }
    }

    //return allAlertReceived;
    return result;
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
        case 'alertReceivedAffectedResourceType':
          where = ` ${op} alert_received_affected_resource_type ${symbol} "${value.value}"`;
          break;
        case 'alertReceivedAffectedResourceName':
          where = ` ${op} alert_received_affected_resource_name ${symbol} "${value.value}"`;
          break;
        case 'alertReceivedPersistentvolumeclaim':
          where = ` ${op} alert_received_persistentvolumeclaim ${symbol} "${value.value}"`;
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
    let allAlertReceived;
    const allAlertReceived1: IAlertReceived[] = await this.alertReceived.findAll({
      limit: 200,
      where: {
        alertReceivedHash: alertHash,
        alertReceivedUiFlag: { [Op.in]: [0, 2, 4, 6, 8] },
        alertReceivedState: { [Op.in]: ['pending', 'firing'] },
      },
    });
    const allAlertReceived2: IAlertReceived[] = await this.alertReceived.findAll({
      where: { alertReceivedHash: alertHash, alertReceivedState: 'resolved' },
    });

    allAlertReceived = allAlertReceived1.concat(allAlertReceived2);

    allAlertReceived = allAlertReceived.sort(function (a, b) {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA < dateB ? 1 : -1; //this is for Decending, for Acending, use -1: 1
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
        recent_alerts.alert_received_persistentvolumeclaim as alertReceivedPersistentvolumeclaim,
        recent_alerts.alert_received_instance as alertReceivedInstance,
        recent_alerts.alert_received_labels as alertReceivedLabels,
        recent_alerts.alert_received_pinned as alertReceivedPinned,
        recent_alerts.alert_received_affected_resource_type alertReceivedAffectedResourceType,
        recent_alerts.alert_received_affected_resource_name alertReceivedAffectedResourceName,
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

  public async findAlertReceivedById(alertReceivedId: string, includeDeleted?: boolean): Promise<IAlertReceived> {
    if (isEmpty(alertReceivedId)) throw new HttpException(400, 'Not a valid Alert Received Id');

    const whereClause = {
      alertReceivedId,
      deletedAt: null,
    };
    if (includeDeleted) {
      delete whereClause['deletedAt'];
    }
    const findAlertReceived: IAlertReceived = await this.alertReceived.findOne({
      where: { ...whereClause },
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
    const findAlertReceived: IAlertReceived = await this.alertReceived.findOne({
      where: { customerAccountKey: customerAccountKey, alertReceivedId: alertReceivedId },
    });

    if (!findAlertReceived) {
      throw new HttpException(404, 'ALERT_NOT_FOUND');
    }

    // TODO: to add more criteria to identify a group of alerts
    const alertReceivedHash = findAlertReceived.alertReceivedHash;
    let allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { alertReceivedHash },
    });

    allAlertReceived = allAlertReceived.sort(function (a, b) {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA < dateB ? 1 : -1; //this is for Decending, for Acending, use -1: 1
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
