import { HttpException } from '@/common/exceptions/HttpException';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { IRuleGroupAlertRule } from '@/common/interfaces/ruleGroupAlertRule.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { RuleGroupAlertRuleDto, UnRegisterRuleGroupAlertRuleDto } from '../dtos/ruleGroupAlertRule.dto';
const { Op } = require('sequelize');
class RuleGroupAlertRuleService {
  public tableIdService = new TableIdService();
  public ruleGroup = DB.RuleGroup;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  
  public async deleteRuleGroupAlertRule(unRegisterAlertRule: UnRegisterRuleGroupAlertRuleDto) {
    try {
      const deleteRuleGroupData = {
        deletedAt: new Date(),
      };

      const result = await this.ruleGroupAlertRule.update(deleteRuleGroupData, {
        where: {
          ...unRegisterAlertRule,
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
    const flag:boolean = await this.deleteRuleGroupAlertRule(unRegisterAlertRule);   
    return flag;
  }


  public async registerAlertRule(ruleGroupAlertRuleData: UnRegisterRuleGroupAlertRuleDto, partyId: string): Promise<IRuleGroupAlertRule> {
    if (isEmpty(ruleGroupAlertRuleData)) throw new HttpException(400, 'UnRegister RuleGroup AlertRule cannot be blank');
    const tableIdName: string = 'RuleGroupAlertRule';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const ruleGroupAlertRuleId: string = responseTableIdData.tableIdFinalIssued;

    const currentDate = new Date();
    const newruleGroupAlertRule = {
      ...ruleGroupAlertRuleData,
      ruleGroupAlertRuleId,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const newnewruleGroupAlertRuleData: IRuleGroupAlertRule = await this.ruleGroupAlertRule.create(newruleGroupAlertRule);
    return newnewruleGroupAlertRuleData;
  }

  public async listRegisterAlertRule(): Promise<IRuleGroupAlertRule[]> {
    const allRuleGroupAlertRule: IRuleGroupAlertRule[] = await this.ruleGroupAlertRule.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allRuleGroupAlertRule;
  }
}

export default RuleGroupAlertRuleService;
