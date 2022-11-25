import { HttpException } from '@/common/exceptions/HttpException';
import { IResolutionAction } from '@/common/interfaces/resolutionAction.interface';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { IRuleGroupResolutionAction } from '@/common/interfaces/ruleGroupResolutionAction.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import RuleGroupService from '@/modules/MetricOps/services/ruleGroup.service';
import { RuleGroupResolutionActionDto, UnRegisterResolutionActionDto } from '../dtos/ruleGroupResolutionAction.dto';
import { ResolutionActionModel } from '../models/resolutionAction.model';
import { SudoryTemplateModel } from '../models/sudoryTemplate.model';
import ResolutionActionService from './resolutionAction.service';
const { Op } = require('sequelize');

class RuleGroupResolutionActionService {
  public tableIdService = new TableIdService();
  public ruleGroup = DB.RuleGroup;
  public resolutionAction = DB.ResolutionAction;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public ruleGroupResolutionAction = DB.RuleGroupResolutionAction;
  public ruleGroupService = new RuleGroupService();
  public resolutionActionService = new ResolutionActionService();

  public async deleteRuleGroupResolutionAction(ruleGroupKey: number, resolutionActionKey: number) {
    try {
      const deleteRuleGroupResolutionAction = {
        deletedAt: new Date(),
      };

      const result = await this.ruleGroupResolutionAction.update(deleteRuleGroupResolutionAction, {
        where: {
          ruleGroupKey: ruleGroupKey,
          resolutionActionKey: resolutionActionKey,
        },
      });
      if (result) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  public async unregisterResolutionAction(unRegisterResolutionActionData: UnRegisterResolutionActionDto, partyId: string): Promise<object> {
    if (isEmpty(unRegisterResolutionActionData)) throw new HttpException(400, 'ruleGroupId or resolutionActionId data is not there');
    // get ruleGroupKey based on ruleGroupId from RuleGroup table

    const ruleGroupData: IRuleGroup = await this.ruleGroupService.findRuleGroupById(unRegisterResolutionActionData.ruleGroupId);
    const { resolutionActionIds } = unRegisterResolutionActionData;
    const ruleGroupKey = ruleGroupData.ruleGroupKey;

    const resolutionActionData: IResolutionAction[] = await this.resolutionAction.findAll({
      where: {
        deletedAt: null,
        resolutionActionId: { [Op.in]: resolutionActionIds },
      },
    });

    const resolutionActionKey = resolutionActionData.map(x => x.resolutionActionKey);
    const query = { where: { ruleGroupKey: ruleGroupKey, resolutionActionKey: { [Op.in]: resolutionActionKey } } };

    const updateRuleGroupResolutionAction = await this.ruleGroupResolutionAction.update({ deletedAt: new Date() }, query);

    return updateRuleGroupResolutionAction;
  }

  public async registerResolutionAction(
    ruleGroupResolutionActionData: RuleGroupResolutionActionDto,
    partyId: string,
  ): Promise<IRuleGroupResolutionAction[]> {
    if (isEmpty(ruleGroupResolutionActionData)) throw new HttpException(400, 'RuleGroup ResolutionAction cannot be blank');
    const uuid = require('uuid');
    //const tableIdName = 'RuleGroupResolutionAction';
    //const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    //const ruleGroupResolutionActionId: string = responseTableIdData.tableIdFinalIssued;

    // get ruleGroupKey based on ruleGroupId from RuleGroup table
    const ruleGroupData: IRuleGroup = await this.ruleGroupService.findRuleGroupById(ruleGroupResolutionActionData.ruleGroupId);
    // get resolutionActionKey based on resolutionActionId from ResolutionAction
    const { resolutionActionIds } = ruleGroupResolutionActionData;
    const resolutionActionData: any = await this.resolutionAction.findAll({
      where: {
        deletedAt: null,
        resolutionActionId: { [Op.in]: resolutionActionIds },
      },
      include: [{ model: SudoryTemplateModel, as: 'sudoryTemplate' }],
    });

    const currentDate = new Date();
    const newRuleGroupResolutionAction = [];
    resolutionActionData.map((resolutionAction: any) => {
      newRuleGroupResolutionAction.push({
        resolutionActionDescription: resolutionAction.resolutionActionDescription,
        sudoryTemplateArgsOption: resolutionAction?.sudoryTemplate.sudoryTemplateArgs,
        ruleGroupResolutionActionId: uuid.v1(),
        ruleGroupKey: ruleGroupData.ruleGroupKey,
        resolutionActionKey: resolutionAction.resolutionActionKey,
        createdAt: currentDate,
        createdBy: partyId,
      });
    });
    const newruleGroupResolutionAction: IRuleGroupResolutionAction[] = await this.ruleGroupResolutionAction.bulkCreate(newRuleGroupResolutionAction);
    return newruleGroupResolutionAction;
  }

  public async listRegisterResolutionAction(ruleGroupId: string): Promise<IRuleGroupResolutionAction[]> {
    const ruleGroupDetails = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    if (isEmpty(ruleGroupDetails)) throw new HttpException(400, ` Rule  Group not found`);
    const allRuleGroupResolutionAction: IRuleGroupResolutionAction[] = await this.ruleGroupResolutionAction.findAll({
      where: { deletedAt: null, ruleGroupKey: ruleGroupDetails.ruleGroupKey },
      include: [
        {
          model: ResolutionActionModel,
          include: [{ model: SudoryTemplateModel, as: 'sudoryTemplate' }],
        },
      ],
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allRuleGroupResolutionAction;
  }
}

export default RuleGroupResolutionActionService;
