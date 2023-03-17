import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertRule, IAlertRuleGraph } from '@/common/interfaces/alertRule.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Sequelize from 'sequelize';
dayjs.extend(utc);

const { Op } = require('sequelize');
import _ from 'lodash';
class AlertRuleService {
  private tableIdService = new TableIdService();
  public alertRule = DB.AlertRule;
  private alertReceived = DB.AlertReceived;
  private ruleGroupAlertRule = DB.RuleGroupAlertRule;
  private resourceGroup = DB.ResourceGroup;
  private ruleGroup = DB.RuleGroup;
  private customerAccount = DB.CustomerAccount;

  public async getAlertRule(customerAccountKey: number): Promise<IAlertRule[]> {
    //    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountId } });
    //    const customerAccountKey = findCustomerAccount.customerAccountKey;
    const allAlertRules: IAlertRule[] = await this.alertRule.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['alertRuleKey', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allAlertRules;
  }

  public async getAlertRuleGraph(customerAccountKey: number, status: string, resourceGroupId?: any): Promise<IAlertRuleGraph[]> {
    let conditionalWhere = {};

    if (status === 'all') {
    } else {
      conditionalWhere = {
        alertRuleState: status,
        ...conditionalWhere,
      };
    }

    let resourceGroupIds: string[] = [];
    if (resourceGroupId) {
      switch (Array.isArray(resourceGroupId)) {
        case true:
          resourceGroupIds = resourceGroupId.map(id => id)
          break
        case false:
          resourceGroupIds.push(resourceGroupId)
          break
      }

      let resourceGroupWhereCondition = {customerAccountKey, deletedAt: null }
      if (resourceGroupIds.length > 0) {
        resourceGroupWhereCondition['resourceGroupId'] = resourceGroupIds
      }

      const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
        where: resourceGroupWhereCondition,
        attributes: { exclude: ['deletedAt'] },
      });

      let resourceGroupUuids: any = [];
      resourceGroups.forEach(resourceGroup => resourceGroupUuids.push(resourceGroup.resourceGroupUuid))

      if (resourceGroupUuids.length > 0) {
        conditionalWhere["resourceGroupUuid"] = resourceGroupUuids
      }
    }

    const ago = dayjs().subtract(1.5, 'hour').utc().toDate();

    const allAlertRules: IAlertRuleGraph[] = await this.alertRule.findAll({
      where: {
        customerAccountKey: customerAccountKey,
        deletedAt: null,
        ...conditionalWhere,
      },
      attributes: {
        exclude: [
          'alertRuleKey',
          'deletedAt',
          'updatedBy',
          'createdBy',
          'alertRuleQuery',
          'customerAccountKey',
          'alertRuleDuration',
          'alertRuleDescription',
          'alertRuleRunbook',
          'createdAt',
          'updatedAt',
        ],
      },
      /*
      group: [
        'alertRuleId',
        Sequelize.col('AlertReceiveds.alert_received_node'),
        Sequelize.col('AlertReceiveds.alert_received_service'),
        Sequelize.col('AlertReceiveds.alert_received_pod'),
      ],
      */
      include: [
        {
          model: this.alertReceived,
          as: 'AlertReceiveds',
          attributes: ['alertReceivedNode', 'alertReceivedService', 'alertReceivedPod'],
          required: false,
          where: {
            deletedAt: null,
            alertReceivedState: status,
            alertReceivedActiveAt: {
              [Op.gt]: ago,
            },
          },
        },
      ],
    });
    return allAlertRules;
  }

  public async findAlertRuleById(alertRuleId: string): Promise<IAlertRule> {
    if (isEmpty(alertRuleId)) throw new HttpException(400, 'Not a valid Alert Rule');

    const findAlertRule: IAlertRule = await this.alertRule.findOne({
      where: { alertRuleId, deletedAt: null },
      attributes: { exclude: ['alertRuleKey', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findAlertRule) throw new HttpException(404, 'NOT_FOUND');

    return findAlertRule;
  }
  public async findAlertRuleKeyById(alertRuleId: string): Promise<number> {
    if (isEmpty(alertRuleId)) throw new HttpException(400, 'Not a valid Alert Rule');

    const findAlertRule: IAlertRule = await this.alertRule.findOne({
      where: { alertRuleId, deletedAt: null },
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findAlertRule) throw new HttpException(404, 'NOT_FOUND');

    return findAlertRule.alertRuleKey;
  }

  public async findAlertRuleKeyByIds(alertRuleIds: string[], customerAccountKey: number): Promise<IAlertRule[]> {
    if (isEmpty(alertRuleIds)) throw new HttpException(400, 'Not a valid Alert Rule');
    const findAlertRule: IAlertRule[] = await this.alertRule.findAll({
      where: { alertRuleId: { [Op.or]: alertRuleIds }, customerAccountKey: customerAccountKey },
      attributes: {
        exclude: [
          'customerAccountKey',
          'deletedAt',
          'updatedBy',
          'createdBy',
          'createdAt',
          'updatedAt',
          'alertRuleName',
          'alertRuleGroup',
          'alertRuleState',
          'alertRuleQuery',
          'alertRuleDuration',
          'alertRuleSeverity',
          'alertRuleDescription',
          'alertRuleSummary',
          'alertRuleRunbook',
          'alertRuleHealth',
          'alertRuleEvaluationTime',
          'alertRuleLastEvaluation',
        ],
      },
    });
    if (!findAlertRule) throw new HttpException(404, 'NOT_FOUND');

    return findAlertRule;
  }

  public async getAlertRuleByKey(alertRuleKey: number): Promise<IAlertRule> {
    if (isEmpty(alertRuleKey)) throw new HttpException(400, 'MISSING_KEY');

    const findAlertRule: IAlertRule = await this.alertRule.findOne({
      where: { alertRuleKey, deletedAt: null },
      attributes: { exclude: ['alertRuleKey', 'customerAccountKey', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findAlertRule) throw new HttpException(404, 'NOT_FOUND');

    return findAlertRule;
  }

  public async getAlertRuleKey(customerAccountKey: number): Promise<number> {
    if (isEmpty(customerAccountKey)) throw new HttpException(400, 'customerAccountKey cannot be blank');
    const alertRuleData: IAlertRule = await this.alertRule.findOne({ where: { customerAccountKey } });
    return alertRuleData.alertRuleKey;
  }

  public async updateAlertRule(
    alertRuleId: string,
    alertRuleData: CreateAlertRuleDto,
    customerAccountKey: number,
    partyId: string,
  ): Promise<IAlertRule> {
    if (isEmpty(alertRuleData)) throw new HttpException(400, 'AlertRule Data cannot be blank');
    const findAlertRule: IAlertRule = await this.alertRule.findOne({ where: { alertRuleId } });
    if (!findAlertRule) throw new HttpException(409, "AlertRule doesn't exist");
    const updatedAlertRuleData = {
      ...alertRuleData,
      customerAccountKey: customerAccountKey,
      updatedBy: partyId,
      updatedAt: new Date(),
    };
    await this.alertRule.update(updatedAlertRuleData, { where: { alertRuleId: alertRuleId } });

    return await this.findAlertRuleById(alertRuleId);
  }

  public async getAlertRuleById(alertRuleId: string): Promise<IAlertRule> {
    if (isEmpty(alertRuleId)) throw new HttpException(400, 'alertRuleId must not be blank.');
    return await this.findAlertRuleById(alertRuleId);
  }

  public async createAlertRule(alertRuleData: CreateAlertRuleDto, customerAccountKey: number, partyId: string): Promise<IAlertRule> {
    if (isEmpty(alertRuleData)) throw new HttpException(400, 'Create AlertRule cannot be blank');
    const tableIdName = 'AlertRule';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempAlertRuleId: string = responseTableIdData.tableIdFinalIssued;

    const currentDate = new Date();
    const newAlertRule = {
      ...alertRuleData,
      customerAccountKey: customerAccountKey,
      alertRuleId: tempAlertRuleId,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const createAlertRuleData: IAlertRule = await this.alertRule.create(newAlertRule);
    return createAlertRuleData;
  }

  public async getAlertRuleByRuleGroupId(ruleGroupId: string) {
    try {
      const ruleGroupDetail: any = await this.ruleGroup.findOne({ where: { ruleGroupId } });
      const ruleGroupAlert = await this.ruleGroupAlertRule.findAll({
        where: { deletedAt: { [Op.eq]: null }, ruleGroupKey: ruleGroupDetail.ruleGroupKey },
        attributes: ['alertRuleKey'],
      });
      let alertRuleKeys: any[];
      if (ruleGroupAlert) {
        alertRuleKeys = _.map(ruleGroupAlert, 'alertRuleKey');
      }
      const allAlertRules: IAlertRule[] = await this.alertRule.findAll({
        where: {
          deletedAt: null,
          alertRuleKey: { [Op.notIn]: alertRuleKeys },
        },
      });
      return allAlertRules;
    } catch (error) {
      return [];
    }
  }

  public async getAlertRuleByResourceGroupUuid(resourceGroupId: string) {
    try {
      const resourceGroup: any = await this.resourceGroup.findOne({ where: { resourceGroupId } });
      if (isEmpty(resourceGroup)) throw new HttpException(400, 'resourceGroup not found.');
      const allAlertRules: IAlertRule[] = await this.alertRule.findAll({
        where: {
          deletedAt: null,
          resourceGroupUuid: resourceGroup.resourceGroupUuid,
        },
      });
      return allAlertRules;
    } catch (error) {
      return [];
    }
  }

  public async deleteAlertRuleByResourceGroupUuid(resourceGroupUuid: string): Promise<object> {
    if (isEmpty(resourceGroupUuid)) throw new HttpException(400, 'ResourceGroupUuid  must not be empty');
    const result = [];
    const findAlertRule: IAlertRule[] = await this.alertRule.findAll({ where: { resourceGroupUuid: resourceGroupUuid } });
    if (!findAlertRule) {
      console.log('no alert rules');
    } else {
      let alertRuleKey = {};

      for (let i = 0; i < findAlertRule.length; i++) {
        alertRuleKey = Object.assign(alertRuleKey, findAlertRule[i].alertRuleKey);
      }

      const queryIn = {
        where: {
          alertRuleKey: { [Op.in]: alertRuleKey },
        },
      };

      const deleteAlertReceived = await this.alertReceived.update({ deletedAt: new Date() }, queryIn);
      const deleteAlertRule = await this.alertRule.update({ deletedAt: new Date() }, { where: { resourceGroupUuid: resourceGroupUuid } });

      result.push(deleteAlertReceived);
      result.push(deleteAlertRule);
    }
    return result;
  }
}

export default AlertRuleService;
