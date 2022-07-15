import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertRule, IAlertRuleGraph } from '@/common/interfaces/alertRule.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const { Op } = require('sequelize');
import _ from 'lodash';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
class AlertRuleService {
  private tableIdService = new TableIdService();
  private alertRule = DB.AlertRule;
  private alertReceived = DB.AlertReceived;
  private ruleGroupAlertRule = DB.RuleGroupAlertRule;
  private resourceGroup = DB.ResourceGroup;
  private ruleGroup = DB.RuleGroup;

  public async getAlertRule(customerAccountKey: number): Promise<IAlertRule[]> {
    const allAlertRules: IAlertRule[] = await this.alertRule.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['alertRuleKey', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allAlertRules;
  }

  public async getAlertRuleGraph(customerAccountKey: number, status: string): Promise<IAlertRuleGraph[]> {
    let conditionalWhere = {};

    if (status === 'firing') {
      const ago = dayjs().subtract(1.5, 'hour').utc().toDate();
      conditionalWhere = {
        alertReceivedActiveAt: {
          [Op.gt]: ago,
        },
      };
    }

    const allAlertRules: IAlertRuleGraph[] = await this.alertRule.findAll({
      where: {
        customerAccountKey: customerAccountKey,
        deletedAt: null,
        alertRuleState: status,
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
          'alertRuleSeverity',
          'alertRuleDescription',
          'alertRuleSummary',
          'alertRuleRunbook',
          'createdAt',
          'updatedAt',
        ],
      },
      /*
      include: [
        {
          model: this.alertReceived,
          attributes: ['alertReceivedId'],
          where: {
            alertReceivedState: status,
            ...conditionalWhere,
          },
        },
      ],
      */
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

    const findAlertRule: IAlertRule = await this.alertRule.findOne({ where: { resourceGroupUuid: resourceGroupUuid } });
    if (!findAlertRule) throw new HttpException(400, "ResourceGroup  doesn't exist");

    const deleteAlertReceived = await this.alertReceived.update({deletedAt: new Date()}, { where: {alertRuleKey: findAlertRule.alertRuleKey} });
    const deleteAlertRule = await this.alertRule.update({deletedAt: new Date()}, { where: {resourceGroupUuid: resourceGroupUuid} });

    console.log (deleteAlertReceived);
    console.log (deleteAlertRule);
    return;
  }



}

export default AlertRuleService;
