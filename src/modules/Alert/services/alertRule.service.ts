import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
const { Op } = require('sequelize');
import _ from 'lodash';
class AlertRuleService {
  public tableIdService = new TableIdService();
  public alertRule = DB.AlertRule;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public ruleGroup = DB.RuleGroup;

  public async getAlertRule(customerAccountKey: number): Promise<IAlertRule[]> {
    const allAlertRules: IAlertRule[] = await this.alertRule.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['alertRuleKey', 'deletedAt', 'updatedBy', 'createdBy'] },
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

  public async updateAlertRule(alertRuleId: string, alertRuleData: CreateAlertRuleDto, customerAccountKey: number, partyId: string): Promise<IAlertRule> {
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

  public async createAlertRule(alertRuleData: CreateAlertRuleDto, customerAccountKey: number, partyId: string): Promise<IAlertRule> {
    if (isEmpty(alertRuleData)) throw new HttpException(400, 'Create AlertRule cannot be blank');
    const tableIdName: string = 'AlertRule';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempAlertRuleId: string = responseTableIdData.tableIdFinalIssued;

    const currentDate = new Date();
    const newAlertRule = {
      ...alertRuleData,
      customerAccountKey: customerAccountKey,
      alertRuleId: tempAlertRuleId,
      createdAt: currentDate,
      createdBy: partyId
    };
    const createAlertRuleData: IAlertRule = await this.alertRule.create(newAlertRule);
    return createAlertRuleData;
  };

  public async getAlertRuleByRuleGroupId(ruleGroupId: string) {
    try {
      const ruleGroupDetail: any = await this.ruleGroup.findOne({ where: { ruleGroupId } });
      console.log("ruleGroupDetail", ruleGroupDetail)
      const ruleGroupAlert = await this.ruleGroupAlertRule.findAll({
        where: { deletedAt: { [Op.eq]: null }, ruleGroupKey: ruleGroupDetail.ruleGroupKey }, attributes: ["alertRuleKey"]
      });
      let alertRuleKeys: any[]
      if (ruleGroupAlert) {
        alertRuleKeys = _.map(ruleGroupAlert, "alertRuleKey")
      }
      const allAlertRules: IAlertRule[] = await this.alertRule.findAll({
        where: {
          deletedAt: null,
          alertRuleKey: { [Op.notIn]: alertRuleKeys }
        },
      });
      return allAlertRules;
    } catch (error) {
      return [];
    }
  }

}

export default AlertRuleService;
