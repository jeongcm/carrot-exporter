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
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';

const { Op } = require('sequelize');
class RuleGroupAlertRuleService {
  public tableIdService = new TableIdService();
  public ruleGroup = DB.RuleGroup;
  public alertRule = DB.AlertRule;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public customerAccount = DB.CustomerAccount;
  public resourceGroup = DB.ResourceGroup;
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

  public async syncMetricOpsAlertRule(customerAccountId): Promise<object> {
    //1. find alert rule key under MetricOps rule group
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountId, deletedAt: null } });
    if (!findCustomerAccount) throw new HttpException(404, 'Cannot find customerAccount');
    const customerAccountKey = findCustomerAccount.customerAccountKey;

    const findResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({ where: { customerAccountKey, deletedAt: null } });
    if (findResourceGroup.length === 0) throw new HttpException(405, 'Cannot find resourceGroup');
    const resourceGroupKey = findResourceGroup.map(x => x.resourceGroupKey);

    const findRuleGroup: IRuleGroup[] = await this.ruleGroup.findAll({ where: { resourceGroupKey, deletedAt: null } });
    if (findRuleGroup.length === 0) throw new HttpException(406, 'Cannot find MetricOps RuleGroup');
    const ruleGroupKey = findRuleGroup.map(x => x.ruleGroupKey);

    const findRuleGroupAlertRule: IRuleGroupAlertRule[] = await this.ruleGroupAlertRule.findAll({ where: { ruleGroupKey, deletedAt: null } });
    const alertRuleKey = findRuleGroupAlertRule.map(x => x.alertRuleKey);

    //2. check AlertRule is still active
    const findAlertRule: IAlertRule[] = await this.alertRule.findAll({ where: { alertRuleKey: { [Op.in]: alertRuleKey }, deletedAt: null } });
    const alertRuleKeyActive = findAlertRule.map(x => x.alertRuleKey);

    //3. find alertrule of RuleGroup - need to be deleted or replaced
    const targetAlerRuleKey = alertRuleKey.filter(x => alertRuleKeyActive.indexOf(x) === -1); // alert rule to be replaced
    const returnMessage = [];
    for (let i = 0; i < targetAlerRuleKey.length; i++) {
      const findAlertRule: IAlertRule = await this.alertRule.findOne({ where: { alertRuleKey: targetAlerRuleKey[i] } });
      const alertRuleName = findAlertRule?.alertRuleName;
      const alertRuleSeverity = findAlertRule?.alertRuleSeverity;
      const resourceGroupUuid = findAlertRule?.resourceGroupUuid;

      const findNewAlertRule: IAlertRule = await this.alertRule.findOne({
        where: { alertRuleKey: { [Op.notIn]: targetAlerRuleKey[i] }, deletedAt: null, alertRuleName, alertRuleSeverity, resourceGroupUuid },
      });
      if (!findNewAlertRule) {
        //delete RuleGroupAlertRule
        await this.ruleGroupAlertRule.update(
          { deletedAt: new Date(), ruleGroupAlertRuleStatus: 'CA' },
          { where: { alertRuleKey: targetAlerRuleKey[i] } },
        );
        returnMessage.push({ deletedAlertRule: targetAlerRuleKey[i] });
      } else {
        //update RuleGroupAlertRule
        await this.ruleGroupAlertRule.update(
          { updatedAt: new Date(), updatedBy: 'SYSTEM', alertRuleKey: findNewAlertRule.alertRuleKey },
          { where: { alertRuleKey: targetAlerRuleKey[i] } },
        );
        returnMessage.push({ updatedAlertRule: `from ${targetAlerRuleKey[i]} to ${findNewAlertRule.alertRuleKey}` });
      }
    }
    return returnMessage;
  }
}

export default RuleGroupAlertRuleService;
