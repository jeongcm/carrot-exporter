import { HttpException } from '@/common/exceptions/HttpException';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { IRuleGroupAlertRule } from '@/common/interfaces/ruleGroupAlertRule.interface';
import { IRuleGroupResolutionAction } from '@/common/interfaces/ruleGroupResolutionAction.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import RuleGroupService from '@/modules/RuleGroup/services/ruleGroup.service';
import { RuleGroupAlertRuleDto, UnRegisterRuleGroupAlertRuleDto } from '../dtos/ruleGroupAlertRule.dto';
import { RuleGroupResolutionActionDto, UnRegisterResolutionActionDto } from '../dtos/ruleGroupResolutionAction.dto';
const { Op } = require('sequelize');

class RuleGroupResolutionActionService {
  public tableIdService = new TableIdService();
  public ruleGroup = DB.RuleGroup;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public ruleGroupResolutionAction = DB.RuleGroupResolutionAction;
  public ruleGroupService = new RuleGroupService();

  public async deleteRuleGroupResolutionAction(ruleGroupKey: number, resolutionActionKey: number) {
    try {
      const deleteRuleGroupResolutionAction = {
        deletedAt: new Date(),
      };

      const result = await this.ruleGroupResolutionAction.update(deleteRuleGroupResolutionAction, {
        where: {
          ruleGroupKey: ruleGroupKey,
          resolutionActionKey: resolutionActionKey,
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

  public async unregisterResolutionAction(unRegisterResolutionActionData: UnRegisterResolutionActionDto, partyId: string): Promise<boolean> {
    if (isEmpty(unRegisterResolutionActionData)) throw new HttpException(400, 'ruleGroupId or resolutionActionId data is not there');
    // get ruleGroupKey based on ruleGroupId from RuleGroup table

    const ruleGroupData: IRuleGroup = await this.ruleGroupService.findRuleGroupById(unRegisterResolutionActionData.ruleGroupId);
    // get resolutionActionKey based on resolutionActionId from ResolutionAction -- pending
    const resolutionActionKey = 34;//dummy data
    const flag: boolean = await this.deleteRuleGroupResolutionAction(ruleGroupData.ruleGroupKey, resolutionActionKey);
    return flag;
  }

  public async registerResolutionAction(
    ruleGroupResolutionActionData: RuleGroupResolutionActionDto,
    partyId: string,
  ): Promise<IRuleGroupResolutionAction> {
    if (isEmpty(ruleGroupResolutionActionData)) throw new HttpException(400, 'RuleGroup ResolutionAction cannot be blank');
    const tableIdName: string = 'RuleGroupResolutionAction';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const ruleGroupResolutionActionId: string = responseTableIdData.tableIdFinalIssued;
    // get ruleGroupKey based on ruleGroupId from RuleGroup table

    const ruleGroupData: IRuleGroup = await this.ruleGroupService.findRuleGroupById(ruleGroupResolutionActionData.ruleGroupId);
    // get resolutionActionKey based on resolutionActionId from ResolutionAction -- pending
    const resolutionActionKey = 34;// dummy data
    const currentDate = new Date();
    const newRuleGroupResolutionAction = {
      resolutionActionDescription:ruleGroupResolutionActionData.resolutionActionDescription,
      sudoryTemplateArgsOption:ruleGroupResolutionActionData.sudoryTemplateArgsOption,
      ruleGroupResolutionActionId,
      ruleGroupKey: ruleGroupData.ruleGroupKey,
      resolutionActionKey: resolutionActionKey,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const newruleGroupResolutionAction: IRuleGroupResolutionAction = await this.ruleGroupResolutionAction.create(newRuleGroupResolutionAction);
    return newruleGroupResolutionAction;
  }

  public async listRegisterResolutionAction(): Promise<IRuleGroupResolutionAction[]> {
    const allRuleGroupResolutionAction: IRuleGroupResolutionAction[] = await this.ruleGroupResolutionAction.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allRuleGroupResolutionAction;
  }
}

export default RuleGroupResolutionActionService;