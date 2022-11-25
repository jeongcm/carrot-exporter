import { HttpException } from '@/common/exceptions/HttpException';
import { IRuleGroupAlertRule } from '@/common/interfaces/ruleGroupAlertRule.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { RuleGroupAlertRuleDto, UnRegisterRuleGroupAlertRuleDto } from '../dtos/ruleGroupAlertRule.dto';
import AlertRuleService from '@/modules/Alert/services/alertRule.service';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import RuleGroupService from './ruleGroup.service';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { AlertRuleModel } from '@/modules/Alert/models/alertRule.model';

const { Op } = require('sequelize');
class RuleGroupAlertRuleService {
  public tableIdService = new TableIdService();
  public ruleGroup = DB.RuleGroup;
  public alertRule = DB.AlertRule;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public alertRuleService = new AlertRuleService();
  public ruleGroupService = new RuleGroupService();

  public async deleteRuleGroupAlertRule(alertRuleKey: number, ruleGroupKey: number) {
    try {
      const deleteRuleGroupData = {
        deletedAt: new Date(),
      };

      const result = await this.ruleGroupAlertRule.update(deleteRuleGroupData, {
        where: {
          ruleGroupKey: ruleGroupKey,
          alertRuleKey: alertRuleKey,
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

  public async unregisterAlertRule(unRegisterAlertRule: UnRegisterRuleGroupAlertRuleDto, partyId: string): Promise<boolean> {
    if (isEmpty(unRegisterAlertRule)) throw new HttpException(400, 'UnRegister RuleGroup AlertRule data is not there');
    const { alertRuleIds } = unRegisterAlertRule;
    // get alertRuleId from AlertRule table
    const alertRuleArray = await this.alertRule.findAll({ where: { alertRuleId: { [Op.in]: alertRuleIds } } });

    // get ruleGroupId from RuleGroup table
    const ruleGroupData: IRuleGroup = await this.ruleGroupService.findRuleGroupById(unRegisterAlertRule.ruleGroupId);
    alertRuleArray.map(async ruleObj => {
      await this.deleteRuleGroupAlertRule(ruleObj.alertRuleKey, ruleGroupData.ruleGroupKey);
    });
    return true;
  }

  public async registerAlertRule(ruleGroupAlertRuleData: RuleGroupAlertRuleDto, partyId: string): Promise<IRuleGroupAlertRule[]> {
    if (isEmpty(ruleGroupAlertRuleData)) throw new HttpException(400, 'Register RuleGroup AlertRule cannot be blank');
    const uuid = require('uuid');
    //const tableIdName = 'RuleGroupAlertRule';
    const { alertRuleIds } = ruleGroupAlertRuleData;
    //const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    //const ruleGroupAlertRuleId: string = responseTableIdData.tableIdFinalIssued;
    // get alertRuleId from AlertRule table
    const alertRuleArray = await this.alertRule.findAll({ where: { alertRuleId: { [Op.in]: alertRuleIds } } });

    // get ruleGroupId from RuleGroup table
    const ruleGroupData: IRuleGroup = await this.ruleGroupService.findRuleGroupById(ruleGroupAlertRuleData.ruleGroupId);
    const currentDate = new Date();
    const newruleGroupAlertRule = [];
    alertRuleArray.map((alertRule: any) => {
      newruleGroupAlertRule.push({
        ruleGroupAlertRuleStatus: ruleGroupAlertRuleData.ruleGroupAlertRuleStatus,
        alertRuleKey: alertRule.alertRuleKey,
        ruleGroupKey: ruleGroupData.ruleGroupKey,
        ruleGroupAlertRuleId: uuid.v1(),
        createdAt: currentDate,
        createdBy: partyId,
      });
    });
    const newRuleGroupAlertRuleData: IRuleGroupAlertRule[] = await this.ruleGroupAlertRule.bulkCreate(newruleGroupAlertRule);
    return newRuleGroupAlertRuleData;
  }

  public async listRegisterAlertRule(ruleGroupId: string): Promise<IRuleGroupAlertRule[]> {
    const alertRuleList = [];
    const ruleGroupDetails = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    if (isEmpty(ruleGroupDetails)) throw new HttpException(400, ` Rule  Group not found`);
    const allRuleGroupAlertRule: IRuleGroupAlertRule[] = await this.ruleGroupAlertRule.findAll({
      where: { ruleGroupKey: ruleGroupDetails.ruleGroupKey, deletedAt: null },
      include: [
        {
          model: AlertRuleModel,
        },
      ],
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });

    allRuleGroupAlertRule.map((alertGroup: any) => {
      const a = alertGroup.AlertRule;
      alertRuleList.push(alertGroup.AlertRule);
    });

    return alertRuleList;
  }
}

export default RuleGroupAlertRuleService;
